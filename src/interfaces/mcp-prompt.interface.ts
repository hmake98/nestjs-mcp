/**
 * Metadata for MCP prompt
 */
export interface MCPPromptMetadata {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}
