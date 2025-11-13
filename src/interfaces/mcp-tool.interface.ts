import { z } from 'zod';
import { MCPToolParameter } from './mcp-protocol.interface';

/**
 * Deprecation information for MCP items
 */
export interface DeprecationInfo {
    /**
     * Whether the item is deprecated
     */
    deprecated: boolean;
    /**
     * Deprecation message explaining why and what to use instead
     */
    message?: string;
    /**
     * Version when the item was deprecated
     */
    since?: string;
    /**
     * Version when the item will be removed
     */
    removeIn?: string;
    /**
     * Replacement item name/identifier
     */
    replacedBy?: string;
}

/**
 * Metadata for MCP tool
 */
export interface MCPToolMetadata {
    name: string;
    description: string;
    /**
     * Zod schema for validating tool input parameters
     * If provided, this will be used for runtime validation and JSON Schema generation
     */
    schema?: z.ZodObject<z.ZodRawShape>;
    /**
     * Version of the tool (e.g., '1.0.0', 'v2', '2023-11-01')
     */
    version?: string;
    /**
     * Deprecation information
     */
    deprecation?: DeprecationInfo;
}

/**
 * Combined decorator for tool with parameters
 */
export interface MCPToolWithParamsMetadata extends MCPToolMetadata {
    /**
     * Manual parameter definitions (legacy approach)
     * Use 'schema' instead for Zod-based validation
     */
    parameters?: Omit<MCPToolParameter, 'name'>[];
    /**
     * Zod schema for validating tool input parameters
     * Preferred over 'parameters' for type-safe validation
     */
    schema?: z.ZodObject<z.ZodRawShape>;
}
