import { ModuleMetadata, Type } from '@nestjs/common';
import { MCPServerInfo, JSONValue } from './mcp-protocol.interface';

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
     */
    enableLogging?: boolean;

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
    ) => Promise<MCPModuleOptions> | MCPModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
}
