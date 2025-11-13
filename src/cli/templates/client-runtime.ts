/* eslint-disable no-undef */
/**
 * Base MCP Client for making JSON-RPC calls to an MCP server
 */
export class MCPClient {
    private idCounter = 1;

    constructor(private readonly baseUrl: string) {}

    /**
     * Make a JSON-RPC call to the MCP server
     */
    async call(method: string, params?: unknown): Promise<unknown> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: this.idCounter++,
                method,
                params,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(
                `MCP Error [${data.error.code}]: ${data.error.message}`,
            );
        }

        return data.result;
    }

    /**
     * Call a tool
     */
    async callTool(
        name: string,
        args: Record<string, unknown>,
    ): Promise<unknown> {
        return this.call('tools/call', { name, arguments: args });
    }

    /**
     * Read a resource
     */
    async readResource(uri: string): Promise<unknown> {
        return this.call('resources/read', { uri });
    }

    /**
     * Get a prompt
     */
    async getPrompt(
        name: string,
        args: Record<string, unknown>,
    ): Promise<unknown> {
        return this.call('prompts/get', { name, arguments: args });
    }
}
