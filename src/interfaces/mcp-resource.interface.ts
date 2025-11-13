import { z } from 'zod';

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
}
