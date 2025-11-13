/**
 * Metadata for MCP resource
 */
export interface MCPResourceMetadata {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}

/**
 * Metadata for MCP resource template
 */
export interface MCPResourceTemplateMetadata {
    uriTemplate: string;
    name: string;
    description?: string;
    mimeType?: string;
}
