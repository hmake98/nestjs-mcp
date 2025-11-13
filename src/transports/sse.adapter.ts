import { Injectable, Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { Request, Response } from 'express';
import { BaseMCPTransportAdapter } from './base-transport.adapter';
import {
    MCPSseOptions,
    MCPRequest,
    MCPResponse as MCPResponseType,
} from '../interfaces';
import { MCPService } from '../services/mcp.service';

interface ClientConnection {
    response: Response;
    subject: Subject<MessageEvent>;
}

/**
 * Server-Sent Events (SSE) transport adapter for MCP protocol
 * Streams MCP events to clients over HTTP using SSE
 */
@Injectable()
@Controller()
export class MCPSseAdapter extends BaseMCPTransportAdapter {
    private readonly sseOptions: Required<
        Pick<MCPSseOptions, 'path' | 'heartbeatInterval' | 'retryInterval'>
    > &
        MCPSseOptions;
    private heartbeatTimer: NodeJS.Timeout | null = null;

    constructor(mcpService: MCPService, options: MCPSseOptions = {}) {
        super(mcpService, options);
        this.sseOptions = {
            path: options.path ?? '/mcp-sse',
            heartbeatInterval: options.heartbeatInterval ?? 30000,
            retryInterval: options.retryInterval ?? 3000,
            ...options,
        };
    }

    /**
     * Start the SSE transport
     */
    async start(): Promise<void> {
        if (this.running) {
            this.logger.warn('SSE transport already running');
            return;
        }

        // Start heartbeat timer
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeat();
        }, this.sseOptions.heartbeatInterval);

        this.running = true;
        this.logger.log(
            `SSE transport started on path ${this.sseOptions.path}`,
        );
    }

    /**
     * Stop the SSE transport
     */
    async stop(): Promise<void> {
        if (!this.running) {
            return;
        }

        // Stop heartbeat
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        // Close all client connections
        this.clients.forEach((client: unknown, clientId: string) => {
            const conn = client as ClientConnection;
            conn.subject.complete();
            conn.response.end();
            this.logger.debug(`Closed SSE connection: ${clientId}`);
        });

        this.clients.clear();
        this.running = false;
        this.logger.log('SSE transport stopped');
    }

    /**
     * Send response to a specific client
     */
    async send(clientId: string, response: MCPResponseType): Promise<void> {
        const client = this.clients.get(clientId) as
            | ClientConnection
            | undefined;

        if (!client) {
            this.logger.warn(`Cannot send to ${clientId}: not connected`);
            return;
        }

        try {
            client.subject.next({
                data: response,
                type: 'mcp-response',
            });
            this.logger.debug(`Sent response to ${clientId}`);
        } catch (error) {
            this.logger.error(`Error sending to ${clientId}:`, error);
            throw error;
        }
    }

    /**
     * Broadcast message to all connected clients
     */
    async broadcast(response: MCPResponseType): Promise<void> {
        const clientIds = Array.from(this.clients.keys());

        for (const clientId of clientIds) {
            try {
                await this.send(clientId, response);
            } catch (error) {
                this.logger.error(`Error broadcasting to ${clientId}:`, error);
            }
        }

        this.logger.debug(`Broadcast to ${clientIds.length} clients`);
    }

    /**
     * SSE endpoint handler
     * This method should be exposed as a controller endpoint
     */
    @Sse('*')
    connect(request: Request, response: Response): Observable<MessageEvent> {
        const clientId = this.generateClientId();
        const subject = new Subject<MessageEvent>();

        // Set SSE headers
        response.setHeader('Content-Type', 'text/event-stream');
        response.setHeader('Cache-Control', 'no-cache');
        response.setHeader('Connection', 'keep-alive');
        response.setHeader('X-Accel-Buffering', 'no');

        // Set retry interval for client
        response.write(`retry: ${this.sseOptions.retryInterval}\n\n`);

        const clientConnection: ClientConnection = {
            response,
            subject,
        };

        this.onClientConnect(clientId, clientConnection);

        // Handle client disconnect
        request.on('close', () => {
            subject.complete();
            this.onClientDisconnect(clientId);
        });

        // Handle request body for POST requests (MCP requests)
        if (request.method === 'POST' && request.body) {
            this.handleIncomingRequest(clientId, request.body as MCPRequest);
        }

        return subject.asObservable();
    }

    /**
     * Handle incoming MCP request via POST
     */
    async handleIncomingRequest(
        clientId: string,
        request: MCPRequest,
    ): Promise<void> {
        try {
            const response = await this.handleRequest(clientId, request);
            await this.send(clientId, response);
        } catch (error) {
            this.logger.error(
                `Error handling request from ${clientId}:`,
                error,
            );
        }
    }

    /**
     * Send heartbeat to all connected clients
     */
    private sendHeartbeat(): void {
        this.clients.forEach((client: unknown, clientId: string) => {
            const conn = client as ClientConnection;
            try {
                conn.subject.next({
                    type: 'heartbeat',
                    data: { timestamp: Date.now() },
                });
            } catch (error) {
                this.logger.error(
                    `Error sending heartbeat to ${clientId}:`,
                    error,
                );
            }
        });
    }
}
