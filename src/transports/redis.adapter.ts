import { Injectable } from '@nestjs/common';
import { BaseMCPTransportAdapter } from './base-transport.adapter';
import {
    MCPRedisOptions,
    MCPRequest,
    MCPResponse as MCPResponseType,
} from '../interfaces';
import { MCPService } from '../services/mcp.service';

// Type-only import (doesn't require the package to be installed)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RedisClient = any;

/**
 * Redis transport adapter for MCP protocol
 * Enables pub/sub communication for multi-process and distributed deployments
 *
 * @requires ioredis - Install with: npm install ioredis
 */
@Injectable()
export class MCPRedisAdapter extends BaseMCPTransportAdapter {
    private publishClient: RedisClient | null = null;
    private subscribeClient: RedisClient | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private Redis: any = null;
    private readonly redisOptions: Required<
        Pick<
            MCPRedisOptions,
            | 'host'
            | 'port'
            | 'channelPrefix'
            | 'requestChannel'
            | 'responseChannel'
        >
    > &
        MCPRedisOptions;

    constructor(mcpService: MCPService, options: MCPRedisOptions = {}) {
        super(mcpService, options);
        this.redisOptions = {
            host: options.host ?? 'localhost',
            port: options.port ?? 6379,
            channelPrefix: options.channelPrefix ?? 'mcp',
            requestChannel: options.requestChannel ?? 'requests',
            responseChannel: options.responseChannel ?? 'responses',
            ...options,
        };
    }

    /**
     * Lazy load Redis dependency
     */
    private async loadRedisDependency(): Promise<void> {
        if (this.Redis) {
            return; // Already loaded
        }

        try {
            const ioredis = await import('ioredis');
            this.Redis = ioredis.default;
        } catch {
            throw new Error(
                'ioredis dependency not found. Please install it with: npm install ioredis',
            );
        }
    }

    /**
     * Start the Redis transport
     */
    async start(): Promise<void> {
        if (this.running) {
            this.logger.warn('Redis transport already running');
            return;
        }

        // Load dependency first
        await this.loadRedisDependency();

        const redisConfig = {
            host: this.redisOptions.host,
            port: this.redisOptions.port,
            password: this.redisOptions.password,
            db: this.redisOptions.db,
            ...this.redisOptions.redisOptions,
        };

        // Create separate clients for pub/sub
        this.publishClient = new this.Redis(redisConfig);
        this.subscribeClient = new this.Redis(redisConfig);

        // Handle Redis errors
        this.publishClient.on('error', (err: Error) =>
            this.handleRedisError('publish', err),
        );
        this.subscribeClient.on('error', (err: Error) =>
            this.handleRedisError('subscribe', err),
        );

        // Subscribe to request channel
        const requestChannel = this.getChannelName(
            this.redisOptions.requestChannel,
        );
        await this.subscribeClient.subscribe(requestChannel);

        // Handle incoming messages
        this.subscribeClient.on(
            'message',
            (channel: string, message: string) => {
                this.handleMessage(channel, message);
            },
        );

        this.running = true;
        this.logger.log(
            `Redis transport started (${this.redisOptions.host}:${this.redisOptions.port})`,
        );
        this.logger.log(`Listening on channel: ${requestChannel}`);
    }

    /**
     * Stop the Redis transport
     */
    async stop(): Promise<void> {
        if (!this.running) {
            return;
        }

        if (this.subscribeClient) {
            await this.subscribeClient.quit();
            this.subscribeClient = null;
        }

        if (this.publishClient) {
            await this.publishClient.quit();
            this.publishClient = null;
        }

        this.clients.clear();
        this.running = false;
        this.logger.log('Redis transport stopped');
    }

    /**
     * Send response to a specific client
     */
    async send(clientId: string, response: MCPResponseType): Promise<void> {
        if (!this.publishClient) {
            throw new Error('Redis publish client not initialized');
        }

        try {
            const channel = this.getResponseChannel(clientId);
            const message = JSON.stringify(response);

            await this.publishClient.publish(channel, message);
            this.logger.debug(`Sent response to ${clientId} on ${channel}`);
        } catch (error) {
            this.logger.error(`Error sending to ${clientId}:`, error);
            throw error;
        }
    }

    /**
     * Broadcast message to all connected clients
     */
    async broadcast(response: MCPResponseType): Promise<void> {
        if (!this.publishClient) {
            throw new Error('Redis publish client not initialized');
        }

        try {
            // Broadcast to a general broadcast channel
            const channel = this.getChannelName('broadcast');
            const message = JSON.stringify(response);

            await this.publishClient.publish(channel, message);
            this.logger.debug(`Broadcast to channel: ${channel}`);
        } catch (error) {
            this.logger.error('Error broadcasting:', error);
            throw error;
        }
    }

    /**
     * Subscribe to responses for a specific client
     * This is typically called by clients to listen for their responses
     */
    async subscribeToClient(clientId: string): Promise<void> {
        if (!this.subscribeClient) {
            throw new Error('Redis subscribe client not initialized');
        }

        const channel = this.getResponseChannel(clientId);
        await this.subscribeClient.subscribe(channel);
        this.onClientConnect(clientId, { channel });
        this.logger.log(`Client ${clientId} subscribed to ${channel}`);
    }

    /**
     * Unsubscribe from client responses
     */
    async unsubscribeFromClient(clientId: string): Promise<void> {
        if (!this.subscribeClient) {
            return;
        }

        const channel = this.getResponseChannel(clientId);
        await this.subscribeClient.unsubscribe(channel);
        this.onClientDisconnect(clientId);
        this.logger.log(`Client ${clientId} unsubscribed from ${channel}`);
    }

    /**
     * Handle incoming Redis message
     */
    private async handleMessage(
        channel: string,
        message: string,
    ): Promise<void> {
        try {
            const data = JSON.parse(message);

            // Handle MCP request
            if (this.isRequestChannel(channel)) {
                const request = data as MCPRequest & { clientId?: string };
                const clientId = request.clientId || this.generateClientId();

                this.logger.debug(
                    `Received request from ${clientId}: ${request.method}`,
                );

                const response = await this.handleRequest(clientId, request);
                await this.send(clientId, response);
            }
        } catch (error) {
            this.logger.error('Error handling Redis message:', error);
            if (this.options.errorHandler) {
                this.options.errorHandler(
                    error instanceof Error ? error : new Error(String(error)),
                );
            }
        }
    }

    /**
     * Check if channel is a request channel
     */
    private isRequestChannel(channel: string): boolean {
        const requestChannel = this.getChannelName(
            this.redisOptions.requestChannel,
        );
        return channel === requestChannel;
    }

    /**
     * Get full channel name with prefix
     */
    private getChannelName(name: string): string {
        return `${this.redisOptions.channelPrefix}:${name}`;
    }

    /**
     * Get response channel for a specific client
     */
    private getResponseChannel(clientId: string): string {
        return this.getChannelName(
            `${this.redisOptions.responseChannel}:${clientId}`,
        );
    }

    /**
     * Handle Redis errors
     */
    private handleRedisError(clientType: string, error: Error): void {
        this.logger.error(`Redis ${clientType} client error:`, error);
        if (this.options.errorHandler) {
            this.options.errorHandler(error);
        }
    }
}
