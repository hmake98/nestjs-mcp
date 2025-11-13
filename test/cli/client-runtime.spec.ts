/**
 * Tests for client-runtime template
 * Note: This file contains runtime code that will be generated, so we test it in isolation
 */

// Declare the class type for use in tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare class MCPClientClass {
    constructor(baseUrl: string);
    call(method: string, params?: unknown): Promise<unknown>;
    callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
    readResource(uri: string): Promise<unknown>;
    getPrompt(name: string, args: Record<string, unknown>): Promise<unknown>;
}

describe('MCPClient Runtime', () => {
    let MCPClient: typeof MCPClientClass;
    let originalFetch: typeof fetch;

    beforeEach(() => {
        // Mock fetch globally
        originalFetch = global.fetch;
        global.fetch = jest.fn();

        // Import the MCPClient class (simulating the generated code)

        MCPClient = class MCPClientClass {
            private idCounter = 1;

            constructor(private readonly baseUrl: string) {}

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
                    throw new Error(
                        `HTTP ${response.status}: ${response.statusText}`,
                    );
                }

                const data = await response.json();

                if (data.error) {
                    throw new Error(
                        `MCP Error [${data.error.code}]: ${data.error.message}`,
                    );
                }

                return data.result;
            }

            async callTool(
                name: string,
                args: Record<string, unknown>,
            ): Promise<unknown> {
                return this.call('tools/call', { name, arguments: args });
            }

            async readResource(uri: string): Promise<unknown> {
                return this.call('resources/read', { uri });
            }

            async getPrompt(
                name: string,
                args: Record<string, unknown>,
            ): Promise<unknown> {
                return this.call('prompts/get', { name, arguments: args });
            }
        };
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    describe('constructor', () => {
        it('should initialize with base URL', () => {
            const client = new MCPClient('http://localhost:3000');
            expect(client).toBeDefined();
        });
    });

    describe('call', () => {
        it('should make successful JSON-RPC call', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    jsonrpc: '2.0',
                    id: 1,
                    result: { data: 'test' },
                }),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const client = new MCPClient('http://localhost:3000');
            const result = await client.call('test/method', { param: 'value' });

            expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'test/method',
                    params: { param: 'value' },
                }),
            });
            expect(result).toEqual({ data: 'test' });
        });

        it('should increment ID counter for each call', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    jsonrpc: '2.0',
                    id: 1,
                    result: {},
                }),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const client = new MCPClient('http://localhost:3000');
            await client.call('method1');
            await client.call('method2');

            const calls = (global.fetch as jest.Mock).mock.calls;
            const body1 = JSON.parse(calls[0][1].body);
            const body2 = JSON.parse(calls[1][1].body);

            expect(body1.id).toBe(1);
            expect(body2.id).toBe(2);
        });

        it('should handle call without params', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    jsonrpc: '2.0',
                    id: 1,
                    result: {},
                }),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const client = new MCPClient('http://localhost:3000');
            await client.call('test/method');

            const calls = (global.fetch as jest.Mock).mock.calls;
            const body = JSON.parse(calls[0][1].body);
            expect(body.params).toBeUndefined();
        });

        it('should throw error on HTTP error response', async () => {
            const mockResponse = {
                ok: false,
                status: 404,
                statusText: 'Not Found',
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const client = new MCPClient('http://localhost:3000');

            await expect(client.call('test/method')).rejects.toThrow(
                'HTTP 404: Not Found',
            );
        });

        it('should throw error on MCP error response', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    jsonrpc: '2.0',
                    id: 1,
                    error: {
                        code: -32600,
                        message: 'Invalid Request',
                    },
                }),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const client = new MCPClient('http://localhost:3000');

            await expect(client.call('test/method')).rejects.toThrow(
                'MCP Error [-32600]: Invalid Request',
            );
        });

        it('should handle different HTTP status codes', async () => {
            const testCases = [
                { status: 500, text: 'Internal Server Error' },
                { status: 401, text: 'Unauthorized' },
                { status: 403, text: 'Forbidden' },
            ];

            for (const testCase of testCases) {
                const mockResponse = {
                    ok: false,
                    status: testCase.status,
                    statusText: testCase.text,
                };
                (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

                const client = new MCPClient('http://localhost:3000');

                await expect(client.call('test/method')).rejects.toThrow(
                    `HTTP ${testCase.status}: ${testCase.text}`,
                );
            }
        });
    });

    describe('callTool', () => {
        it('should call tools/call method with arguments', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    jsonrpc: '2.0',
                    id: 1,
                    result: { content: [{ type: 'text', text: 'result' }] },
                }),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const client = new MCPClient('http://localhost:3000');
            const result = await client.callTool('myTool', { arg1: 'value1' });

            const calls = (global.fetch as jest.Mock).mock.calls;
            const body = JSON.parse(calls[0][1].body);

            expect(body.method).toBe('tools/call');
            expect(body.params).toEqual({
                name: 'myTool',
                arguments: { arg1: 'value1' },
            });
            expect(result).toEqual({
                content: [{ type: 'text', text: 'result' }],
            });
        });

        it('should handle empty arguments', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    jsonrpc: '2.0',
                    id: 1,
                    result: {},
                }),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const client = new MCPClient('http://localhost:3000');
            await client.callTool('myTool', {});

            const calls = (global.fetch as jest.Mock).mock.calls;
            const body = JSON.parse(calls[0][1].body);

            expect(body.params.arguments).toEqual({});
        });
    });

    describe('readResource', () => {
        it('should call resources/read method with URI', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    jsonrpc: '2.0',
                    id: 1,
                    result: {
                        contents: [{ uri: 'resource://test', text: 'content' }],
                    },
                }),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const client = new MCPClient('http://localhost:3000');
            const result = await client.readResource('resource://test');

            const calls = (global.fetch as jest.Mock).mock.calls;
            const body = JSON.parse(calls[0][1].body);

            expect(body.method).toBe('resources/read');
            expect(body.params).toEqual({ uri: 'resource://test' });
            expect(result).toEqual({
                contents: [{ uri: 'resource://test', text: 'content' }],
            });
        });

        it('should handle different URI formats', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    jsonrpc: '2.0',
                    id: 1,
                    result: {},
                }),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const client = new MCPClient('http://localhost:3000');
            await client.readResource('file:///path/to/file');

            const calls = (global.fetch as jest.Mock).mock.calls;
            const body = JSON.parse(calls[0][1].body);

            expect(body.params.uri).toBe('file:///path/to/file');
        });
    });

    describe('getPrompt', () => {
        it('should call prompts/get method with arguments', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    jsonrpc: '2.0',
                    id: 1,
                    result: {
                        messages: [
                            {
                                role: 'user',
                                content: { type: 'text', text: 'prompt' },
                            },
                        ],
                    },
                }),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const client = new MCPClient('http://localhost:3000');
            const result = await client.getPrompt('myPrompt', { arg: 'value' });

            const calls = (global.fetch as jest.Mock).mock.calls;
            const body = JSON.parse(calls[0][1].body);

            expect(body.method).toBe('prompts/get');
            expect(body.params).toEqual({
                name: 'myPrompt',
                arguments: { arg: 'value' },
            });
            expect(result).toEqual({
                messages: [
                    { role: 'user', content: { type: 'text', text: 'prompt' } },
                ],
            });
        });

        it('should handle prompt with empty arguments', async () => {
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({
                    jsonrpc: '2.0',
                    id: 1,
                    result: { messages: [] },
                }),
            };
            (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

            const client = new MCPClient('http://localhost:3000');
            await client.getPrompt('myPrompt', {});

            const calls = (global.fetch as jest.Mock).mock.calls;
            const body = JSON.parse(calls[0][1].body);

            expect(body.params.arguments).toEqual({});
        });
    });
});
