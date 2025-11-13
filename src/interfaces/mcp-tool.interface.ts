import { z } from 'zod';
import { MCPToolParameter } from './mcp-protocol.interface';

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
