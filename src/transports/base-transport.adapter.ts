import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { MCPService } from '../services/mcp.service';
import {
    MCPTransportAdapter,
    MCPTransportOptions,
    MCPResponse,
    MCPRequest,
} from '../interfaces';
import { MCPLogger, LogLevel } from '../utils';

/**
 * Abstract base class for MCP transport adapters
 * Provides common functionality for all transport implementations
 */
@Injectable()
export abstract class BaseMCPTransportAdapter
    implements MCPTransportAdapter, OnModuleDestroy
{
    protected logger: MCPLogger;
    protected running = false;
    protected clients = new Map<string, unknown>();

    constructor(
        protected readonly mcpService: MCPService,
        protected readonly options: MCPTransportOptions,
    ) {
        this.logger = new MCPLogger(
            this.constructor.name,
            options.debug ? LogLevel.DEBUG : LogLevel.INFO,
        );
    }

    /**
     * Initialize the transport adapter
     */
    abstract start(): Promise<void>;

    /**
     * Stop the transport adapter and clean up resources
     */
    abstract stop(): Promise<void>;

    /**
     * Send a response through the transport
     */
    abstract send(clientId: string, response: MCPResponse): Promise<void>;

    /**
     * Broadcast a message to all connected clients
     */
    abstract broadcast(response: MCPResponse): Promise<void>;

    /**
     * Check if the transport is currently running
     */
    isRunning(): boolean {
        return this.running;
    }

    /**
     * Get the list of connected client IDs
     */
    getConnectedClients(): string[] {
        return Array.from(this.clients.keys());
    }

    /**
     * Handle incoming MCP request
     */
    protected async handleRequest(
        clientId: string,
        request: MCPRequest,
    ): Promise<MCPResponse> {
        try {
            this.logger.debug(
                `Handling request from ${clientId}: ${request.method}`,
            );
            return await this.mcpService.handleRequest(request);
        } catch (error) {
            this.logger.error(
                `Error handling request from ${clientId}:`,
                error,
            );
            if (this.options.errorHandler) {
                this.options.errorHandler(
                    error instanceof Error ? error : new Error(String(error)),
                    clientId,
                );
            }
            throw error;
        }
    }

    /**
     * Handle client connection
     */
    protected onClientConnect(clientId: string, client: unknown): void {
        if (
            this.options.maxConnections &&
            this.clients.size >= this.options.maxConnections
        ) {
            this.logger.warn(
                `Max connections (${this.options.maxConnections}) reached, rejecting ${clientId}`,
            );
            return;
        }

        this.clients.set(clientId, client);
        this.logger.log(`Client connected: ${clientId}`);
    }

    /**
     * Handle client disconnection
     */
    protected onClientDisconnect(clientId: string): void {
        this.clients.delete(clientId);
        this.logger.log(`Client disconnected: ${clientId}`);
    }

    /**
     * Generate unique client ID
     */
    protected generateClientId(): string {
        return `client-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * NestJS lifecycle hook
     */
    async onModuleDestroy(): Promise<void> {
        if (this.running) {
            await this.stop();
        }
    }
}
