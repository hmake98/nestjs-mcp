import { MCPResponse } from './mcp-protocol.interface';

/**
 * Transport adapter interface for different communication protocols
 */
export interface MCPTransportAdapter {
    /**
     * Initialize the transport adapter
     */
    start(): Promise<void>;

    /**
     * Stop the transport adapter and clean up resources
     */
    stop(): Promise<void>;

    /**
     * Check if the transport is currently running
     */
    isRunning(): boolean;

    /**
     * Send a response through the transport
     */
    send(clientId: string, response: MCPResponse): Promise<void>;

    /**
     * Broadcast a message to all connected clients
     */
    broadcast(response: MCPResponse): Promise<void>;

    /**
     * Get the list of connected client IDs
     */
    getConnectedClients(): string[];
}

/**
 * Transport adapter options base interface
 */
export interface MCPTransportOptions {
    /**
     * Enable debug logging for the transport
     */
    debug?: boolean;

    /**
     * Custom error handler
     */
    errorHandler?: (error: Error, clientId?: string) => void;

    /**
     * Maximum number of concurrent connections (if applicable)
     */
    maxConnections?: number;

    /**
     * Connection timeout in milliseconds
     */
    connectionTimeout?: number;
}

/**
 * WebSocket transport options
 */
export interface MCPWebSocketOptions extends MCPTransportOptions {
    /**
     * Port to listen on
     */
    port?: number;

    /**
     * Host to bind to
     */
    host?: string;

    /**
     * Path for WebSocket endpoint
     */
    path?: string;

    /**
     * Enable per-message deflate compression
     */
    perMessageDeflate?: boolean;

    /**
     * Maximum payload size in bytes
     */
    maxPayload?: number;
}

/**
 * Server-Sent Events transport options
 */
export interface MCPSseOptions extends MCPTransportOptions {
    /**
     * Endpoint path for SSE connections
     */
    path?: string;

    /**
     * Heartbeat interval in milliseconds
     */
    heartbeatInterval?: number;

    /**
     * Retry interval sent to clients (milliseconds)
     */
    retryInterval?: number;
}

/**
 * Redis transport options
 */
export interface MCPRedisOptions extends MCPTransportOptions {
    /**
     * Redis connection host
     */
    host?: string;

    /**
     * Redis connection port
     */
    port?: number;

    /**
     * Redis password
     */
    password?: string;

    /**
     * Redis database number
     */
    db?: number;

    /**
     * Channel prefix for pub/sub
     */
    channelPrefix?: string;

    /**
     * Request channel name
     */
    requestChannel?: string;

    /**
     * Response channel name pattern
     */
    responseChannel?: string;

    /**
     * Redis connection options (for ioredis)
     */
    redisOptions?: {
        [key: string]: unknown;
    };
}

/**
 * gRPC transport options
 */
export interface MCPGrpcOptions extends MCPTransportOptions {
    /**
     * Port to listen on
     */
    port?: number;

    /**
     * Host to bind to
     */
    host?: string;

    /**
     * Path to proto file
     */
    protoPath?: string;

    /**
     * gRPC package name
     */
    packageName?: string;

    /**
     * gRPC service name
     */
    serviceName?: string;

    /**
     * Enable TLS/SSL
     */
    secure?: boolean;

    /**
     * Server credentials options
     */
    credentials?: {
        rootCerts?: Uint8Array;
        privateKey?: Uint8Array;
        certChain?: Uint8Array;
    };
}

/**
 * Transport type enum
 */
export enum MCPTransportType {
    HTTP = 'http',
    WEBSOCKET = 'websocket',
    SSE = 'sse',
    REDIS = 'redis',
    GRPC = 'grpc',
    STDIO = 'stdio',
}

/**
 * Transport configuration
 */
export interface MCPTransportConfig {
    type: MCPTransportType;
    enabled?: boolean;
    options?:
        | MCPWebSocketOptions
        | MCPSseOptions
        | MCPRedisOptions
        | MCPGrpcOptions
        | MCPTransportOptions;
}
