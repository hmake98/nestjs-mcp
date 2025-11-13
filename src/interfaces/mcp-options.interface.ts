import { ModuleMetadata, Type, Abstract } from '@nestjs/common';
import { MCPServerInfo, JSONValue } from './mcp-protocol.interface';
import { LogLevel, LogLevelName } from '../utils/logger';

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
