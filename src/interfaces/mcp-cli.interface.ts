import {
    MCPToolDefinition,
    DiscoveredMCPResource,
    DiscoveredMCPPrompt,
} from './mcp-protocol.interface';

/**
 * Options for generating a type-safe TypeScript client
 */
export interface GenerateClientOptions {
    serverUrl: string;
    outputDir: string;
    clientName: string;
}

/**
 * Server introspection result containing all available tools, resources, and prompts
 */
export interface ServerIntrospection {
    tools: MCPToolDefinition[];
    resources: DiscoveredMCPResource[];
    prompts: DiscoveredMCPPrompt[];
    serverInfo: {
        name: string;
        version: string;
    };
}
