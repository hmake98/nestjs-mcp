import { z } from 'zod';
import { DeprecationInfo } from './mcp-tool.interface';

/**
 * Metadata for MCP resource
 */
export interface MCPResourceMetadata {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
    /**
     * Zod schema for validating resource read parameters
     * Use this for static resources that may accept query parameters
     */
    schema?: z.ZodObject<z.ZodRawShape>;
    /**
     * Version of the resource (e.g., '1.0.0', 'v2', '2023-11-01')
     */
    version?: string;
    /**
     * Deprecation information
     */
    deprecation?: DeprecationInfo;
}

/**
 * Metadata for MCP resource template
 */
export interface MCPResourceTemplateMetadata {
    uriTemplate: string;
    name: string;
    description?: string;
    mimeType?: string;
    /**
     * Zod schema for validating URI template variables
     * This ensures that extracted variables from the URI match expected types
     */
    schema?: z.ZodObject<z.ZodRawShape>;
    /**
     * Version of the resource template (e.g., '1.0.0', 'v2', '2023-11-01')
     */
    version?: string;
    /**
     * Deprecation information
     */
    deprecation?: DeprecationInfo;
}
