import axios from 'axios';
import { ServerIntrospection } from '../interfaces';

/**
 * Introspects a running MCP server to discover all available tools, resources, and prompts
 */
export async function introspectServer(
    serverUrl: string,
): Promise<ServerIntrospection> {
    const client = axios.create({
        baseURL: serverUrl,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Initialize connection
    const initResponse = await client.post('', {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
                name: 'nestjs-mcp-generator',
                version: '1.0.0',
            },
        },
    });

    const serverInfo = initResponse.data.result?.serverInfo || {
        name: 'unknown',
        version: '1.0.0',
    };

    // Fetch tools
    const toolsResponse = await client.post('', {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
    });

    const tools = toolsResponse.data.result?.tools || [];

    // Fetch resources
    const resourcesResponse = await client.post('', {
        jsonrpc: '2.0',
        id: 3,
        method: 'resources/list',
    });

    const resources = resourcesResponse.data.result?.resources || [];

    // Fetch prompts
    const promptsResponse = await client.post('', {
        jsonrpc: '2.0',
        id: 4,
        method: 'prompts/list',
    });

    const prompts = promptsResponse.data.result?.prompts || [];

    return {
        tools,
        resources,
        prompts,
        serverInfo,
    };
}
