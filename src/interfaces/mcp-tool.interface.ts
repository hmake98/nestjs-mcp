import { MCPToolParameter } from './mcp-protocol.interface';

/**
 * Metadata for MCP tool
 */
export interface MCPToolMetadata {
    name: string;
    description: string;
}

/**
 * Combined decorator for tool with parameters
 */
export interface MCPToolWithParamsMetadata extends MCPToolMetadata {
    parameters: Omit<MCPToolParameter, 'name'>[];
}
