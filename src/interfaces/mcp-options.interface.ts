import { ModuleMetadata, Type, Abstract } from '@nestjs/common';
import { MCPServerInfo, JSONValue } from './mcp-protocol.interface';
import { LogLevel, LogLevelName } from './mcp-logger.interface';
import { MCPTransportConfig } from './mcp-transport.interface';

/**
 * Options for configuring the MCP module
 */
export interface MCPModuleOptions {
    /**
     * Server information
     */
    serverInfo: MCPServerInfo;

    /**
     * Enable automatic tool discovery from providers
     */
    autoDiscoverTools?: boolean;

    /**
     * Enable automatic resource discovery from providers
     */
    autoDiscoverResources?: boolean;

    /**
     * Enable automatic prompt discovery from providers
     */
    autoDiscoverPrompts?: boolean;

    /**
     * Global prefix for all MCP endpoints
     */
    globalPrefix?: string;

    /**
     * Use root-level path for MCP endpoints (bypasses application global prefix)
     * When true, MCP endpoints will be at /mcp regardless of app.setGlobalPrefix()
     *
     * **Important**: You must configure your application to exclude MCP paths from the global prefix:
     * ```typescript
     * app.setGlobalPrefix('v1', {
     *     exclude: ['/mcp(.*)'] // Exclude all MCP endpoints
     * });
     * ```
     *
     * Example with app.setGlobalPrefix('v1') and exclude configured:
     * - rootPath: true → /mcp, /mcp/batch, /mcp/playground
     * - rootPath: false → /v1/mcp, /v1/mcp/batch, /v1/mcp/playground
     *
     * Application-level guards, interceptors, and middleware will still apply to /mcp routes.
     * @default false
     */
    rootPath?: boolean;

    /**
     * Metadata key for marking routes that should bypass authentication
     * The playground endpoint is automatically marked as public
     * @default 'isPublic'
     */
    publicMetadataKey?: string;

    /**
     * Enable request/response logging
     * @deprecated Use logLevel instead for more granular control
     */
    enableLogging?: boolean;

    /**
     * Set the log level for the MCP module
     * Levels: 'error' | 'warn' | 'info' | 'debug' | 'verbose'
     * Default: 'info'
     */
    logLevel?: LogLevel | LogLevelName;

    /**
     * Custom error handler
     */
    errorHandler?: (error: Error) => JSONValue;

    /**
     * Transport configurations
     * Can enable multiple transports simultaneously (HTTP, WebSocket, SSE, Redis, gRPC)
     * HTTP transport is always enabled by default via the controller
     */
    transports?: MCPTransportConfig[];
}

/**
 * Options factory interface for async configuration
 */
export interface MCPOptionsFactory {
    createMCPOptions(): Promise<MCPModuleOptions> | MCPModuleOptions;
}

/**
 * Async options for MCP module
 */
export interface MCPModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<MCPOptionsFactory>;
    useClass?: Type<MCPOptionsFactory>;
    useFactory?: (
        ...args: unknown[]
    ) => Promise<MCPModuleOptions> | MCPModuleOptions;
    inject?: (string | symbol | Type | Abstract<unknown>)[];
}
