import { z } from 'zod';
import { DeprecationInfo } from './mcp-tool.interface';

/**
 * Metadata for MCP prompt
 */
export interface MCPPromptMetadata {
    name: string;
    description?: string;
    /**
     * Manual argument definitions (legacy approach)
     * Use 'schema' instead for Zod-based validation
     */
    arguments?: Array<{
        name: string;
        description?: string;
        required?: boolean;
    }>;
    /**
     * Zod schema for validating prompt arguments
     * Preferred over 'arguments' for type-safe validation
     */
    schema?: z.ZodObject<z.ZodRawShape>;
    /**
     * Version of the prompt (e.g., '1.0.0', 'v2', '2023-11-01')
     */
    version?: string;
    /**
     * Deprecation information
     */
    deprecation?: DeprecationInfo;
}
