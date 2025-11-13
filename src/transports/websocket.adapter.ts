import { Injectable } from '@nestjs/common';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { IncomingMessage } from 'http';
import { BaseMCPTransportAdapter } from './base-transport.adapter';
import {
    MCPWebSocketOptions,
    MCPRequest,
    MCPResponse,
    JSONValue,
} from '../interfaces';
import { MCPService } from '../services/mcp.service';

/**
 * WebSocket transport adapter for MCP protocol
 * Handles JSON-RPC communication over WebSocket connections
 */
@Injectable()
export class MCPWebSocketAdapter extends BaseMCPTransportAdapter {
    private wss: WebSocketServer | null = null;
    private readonly wsOptions: Required<
        Pick<MCPWebSocketOptions, 'port' | 'host' | 'path'>
    > &
        MCPWebSocketOptions;

    constructor(mcpService: MCPService, options: MCPWebSocketOptions = {}) {
        super(mcpService, options);
        this.wsOptions = {
            port: options.port ?? 3001,
            host: options.host ?? '0.0.0.0',
            path: options.path ?? '/mcp-ws',
            perMessageDeflate: options.perMessageDeflate ?? false,
            maxPayload: options.maxPayload ?? 10 * 1024 * 1024, // 10MB default
            ...options,
        };
    }

    /**
     * Start the WebSocket server
     */
    async start(): Promise<void> {
        if (this.running) {
            this.logger.warn('WebSocket transport already running');
            return;
        }

        this.wss = new WebSocketServer({
            host: this.wsOptions.host,
            port: this.wsOptions.port,
            path: this.wsOptions.path,
            perMessageDeflate: this.wsOptions.perMessageDeflate,
            maxPayload: this.wsOptions.maxPayload,
        });

        this.wss.on('connection', this.handleConnection.bind(this));
        this.wss.on('error', this.handleServerError.bind(this));

        this.running = true;
        this.logger.log(
            `WebSocket transport started on ws://${this.wsOptions.host}:${this.wsOptions.port}${this.wsOptions.path}`,
        );
    }

    /**
     * Stop the WebSocket server
     */
    async stop(): Promise<void> {
        if (!this.running || !this.wss) {
            return;
        }

        return new Promise((resolve, reject) => {
            // Close all client connections
            this.clients.forEach((ws: unknown) => {
                if (
                    ws instanceof WebSocket &&
                    (ws as WebSocket).readyState === WebSocket.OPEN
                ) {
                    (ws as WebSocket).close(1000, 'Server shutting down');
                }
            });

            this.wss!.close((err?: Error) => {
                if (err) {
                    this.logger.error('Error stopping WebSocket server:', err);
                    reject(err);
                } else {
                    this.running = false;
                    this.wss = null;
                    this.clients.clear();
                    this.logger.log('WebSocket transport stopped');
                    resolve();
                }
            });
        });
    }

    /**
     * Send response to a specific client
     */
    async send(clientId: string, response: MCPResponse): Promise<void> {
        const ws = this.clients.get(clientId) as WebSocket | undefined;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            this.logger.warn(`Cannot send to ${clientId}: not connected`);
            return;
        }

        try {
            const message = JSON.stringify(response);
            ws.send(message);
            this.logger.debug(`Sent response to ${clientId}`);
        } catch (error) {
            this.logger.error(`Error sending to ${clientId}:`, error);
            throw error;
        }
    }

    /**
     * Broadcast message to all connected clients
     */
    async broadcast(response: MCPResponse): Promise<void> {
        const message = JSON.stringify(response);
        const sendPromises: Promise<void>[] = [];

        this.clients.forEach((ws: unknown, clientId: string) => {
            if (
                ws instanceof WebSocket &&
                (ws as WebSocket).readyState === WebSocket.OPEN
            ) {
                sendPromises.push(
                    new Promise((resolve, reject) => {
                        (ws as WebSocket).send(message, (err?: Error) => {
                            if (err) {
                                this.logger.error(
                                    `Error broadcasting to ${clientId}:`,
                                    err,
                                );
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    }),
                );
            }
        });

        await Promise.allSettled(sendPromises);
        this.logger.debug(`Broadcast to ${sendPromises.length} clients`);
    }

    /**
     * Handle new WebSocket connection
     */
    private handleConnection(ws: WebSocket, request: IncomingMessage): void {
        const clientId = this.generateClientId();

        // Apply connection timeout if specified
        if (this.options.connectionTimeout) {
            ws.once('message', () => {
                // Clear timeout on first message
            });
            setTimeout(() => {
                if (
                    ws.readyState === WebSocket.OPEN &&
                    !this.clients.has(clientId)
                ) {
                    ws.close(1000, 'Connection timeout');
                }
            }, this.options.connectionTimeout);
        }

        this.onClientConnect(clientId, ws);

        ws.on('message', (data: RawData) => this.handleMessage(clientId, data));
        ws.on('error', (error: Error) =>
            this.handleClientError(clientId, error),
        );
        ws.on('close', () => this.onClientDisconnect(clientId));

        this.logger.debug(
            `New WebSocket connection from ${request.socket.remoteAddress}`,
        );
    }

    /**
     * Handle incoming WebSocket message
     */
    private async handleMessage(
        clientId: string,
        data: RawData,
    ): Promise<void> {
        try {
            const message = data.toString();
            const request = JSON.parse(message) as MCPRequest;

            this.logger.debug(
                `Received request from ${clientId}: ${request.method}`,
            );

            const response = await this.handleRequest(clientId, request);
            await this.send(clientId, response);
        } catch (error) {
            this.logger.error(
                `Error processing message from ${clientId}:`,
                error,
            );

            // Send error response if possible
            const ws = this.clients.get(clientId) as WebSocket | undefined;
            if (ws && ws.readyState === WebSocket.OPEN) {
                const errorResponse: MCPResponse = {
                    jsonrpc: '2.0',
                    id: null as unknown as string | number,
                    error: {
                        code: -32700,
                        message: 'Parse error',
                        data:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    } as { code: number; message: string; data?: JSONValue },
                };
                ws.send(JSON.stringify(errorResponse));
            }
        }
    }

    /**
     * Handle WebSocket client error
     */
    private handleClientError(clientId: string, error: Error): void {
        this.logger.error(`WebSocket client error for ${clientId}:`, error);
        if (this.options.errorHandler) {
            this.options.errorHandler(error, clientId);
        }
    }

    /**
     * Handle WebSocket server error
     */
    private handleServerError(error: Error): void {
        this.logger.error('WebSocket server error:', error);
        if (this.options.errorHandler) {
            this.options.errorHandler(error);
        }
    }
}
