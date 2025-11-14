import { introspectServer } from '../../src/cli/introspector';
import axios from 'axios';

jest.mock('axios');

describe('introspectServer', () => {
    const mockAxiosInstance = {
        post: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    });

    it('should introspect server and return full data', async () => {
        mockAxiosInstance.post
            .mockResolvedValueOnce({
                data: {
                    result: {
                        serverInfo: {
                            name: 'Test Server',
                            version: '1.0.0',
                        },
                    },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: {
                        tools: [
                            {
                                name: 'tool1',
                                description: 'Tool 1',
                            },
                            {
                                name: 'tool2',
                                description: 'Tool 2',
                            },
                        ],
                    },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: {
                        resources: [
                            {
                                name: 'resource1',
                                uri: 'resource://1',
                            },
                        ],
                    },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: {
                        prompts: [
                            {
                                name: 'prompt1',
                                description: 'Prompt 1',
                            },
                        ],
                    },
                },
            });

        const result = await introspectServer('http://localhost:3000');

        expect(axios.create).toHaveBeenCalledWith({
            baseURL: 'http://localhost:3000',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(4);

        // Check initialize call
        expect(mockAxiosInstance.post).toHaveBeenNthCalledWith(1, '', {
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

        // Check tools/list call
        expect(mockAxiosInstance.post).toHaveBeenNthCalledWith(2, '', {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
        });

        // Check resources/list call
        expect(mockAxiosInstance.post).toHaveBeenNthCalledWith(3, '', {
            jsonrpc: '2.0',
            id: 3,
            method: 'resources/list',
        });

        // Check prompts/list call
        expect(mockAxiosInstance.post).toHaveBeenNthCalledWith(4, '', {
            jsonrpc: '2.0',
            id: 4,
            method: 'prompts/list',
        });

        expect(result).toEqual({
            tools: [
                { name: 'tool1', description: 'Tool 1', parameters: [] },
                { name: 'tool2', description: 'Tool 2', parameters: [] },
            ],
            resources: [{ name: 'resource1', uri: 'resource://1' }],
            prompts: [{ name: 'prompt1', description: 'Prompt 1' }],
            serverInfo: {
                name: 'Test Server',
                version: '1.0.0',
            },
        });
    });

    it('should handle missing serverInfo and use defaults', async () => {
        mockAxiosInstance.post
            .mockResolvedValueOnce({
                data: {
                    result: {},
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: { tools: [] },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: { resources: [] },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: { prompts: [] },
                },
            });

        const result = await introspectServer('http://localhost:3000');

        expect(result.serverInfo).toEqual({
            name: 'unknown',
            version: '1.0.0',
        });
    });

    it('should handle missing tools array', async () => {
        mockAxiosInstance.post
            .mockResolvedValueOnce({
                data: {
                    result: {
                        serverInfo: { name: 'Test', version: '1.0.0' },
                    },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: {},
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: { resources: [] },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: { prompts: [] },
                },
            });

        const result = await introspectServer('http://localhost:3000');

        expect(result.tools).toEqual([]);
    });

    it('should handle missing resources array', async () => {
        mockAxiosInstance.post
            .mockResolvedValueOnce({
                data: {
                    result: {
                        serverInfo: { name: 'Test', version: '1.0.0' },
                    },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: { tools: [] },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: {},
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: { prompts: [] },
                },
            });

        const result = await introspectServer('http://localhost:3000');

        expect(result.resources).toEqual([]);
    });

    it('should handle missing prompts array', async () => {
        mockAxiosInstance.post
            .mockResolvedValueOnce({
                data: {
                    result: {
                        serverInfo: { name: 'Test', version: '1.0.0' },
                    },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: { tools: [] },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: { resources: [] },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: {},
                },
            });

        const result = await introspectServer('http://localhost:3000');

        expect(result.prompts).toEqual([]);
    });

    it('should handle null result in initialize response', async () => {
        mockAxiosInstance.post
            .mockResolvedValueOnce({
                data: {
                    result: null,
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: { tools: [] },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: { resources: [] },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: { prompts: [] },
                },
            });

        const result = await introspectServer('http://localhost:3000');

        expect(result.serverInfo).toEqual({
            name: 'unknown',
            version: '1.0.0',
        });
    });

    it('should propagate axios errors', async () => {
        mockAxiosInstance.post.mockRejectedValueOnce(
            new Error('Network error'),
        );

        await expect(introspectServer('http://localhost:3000')).rejects.toThrow(
            'Network error',
        );
    });

    it('should handle server URL with trailing slash', async () => {
        mockAxiosInstance.post
            .mockResolvedValueOnce({
                data: {
                    result: {
                        serverInfo: { name: 'Test', version: '1.0.0' },
                    },
                },
            })
            .mockResolvedValueOnce({
                data: { result: { tools: [] } },
            })
            .mockResolvedValueOnce({
                data: { result: { resources: [] } },
            })
            .mockResolvedValueOnce({
                data: { result: { prompts: [] } },
            });

        await introspectServer('http://localhost:3000/');

        expect(axios.create).toHaveBeenCalledWith({
            baseURL: 'http://localhost:3000/',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    });

    it('should handle tools with no inputSchema', async () => {
        mockAxiosInstance.post
            .mockResolvedValueOnce({
                data: {
                    result: {
                        serverInfo: {
                            name: 'Test Server',
                            version: '1.0.0',
                        },
                    },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    result: {
                        tools: [
                            {
                                name: 'tool-no-schema',
                                description: 'Tool without schema',
                                inputSchema: null,
                            },
                            {
                                name: 'tool-invalid-schema',
                                description: 'Tool with invalid schema',
                                inputSchema: 'invalid',
                            },
                            {
                                name: 'tool-no-properties',
                                description: 'Tool without properties',
                                inputSchema: { type: 'object' },
                            },
                        ],
                    },
                },
            })
            .mockResolvedValueOnce({
                data: { result: { resources: [] } },
            })
            .mockResolvedValueOnce({
                data: { result: { prompts: [] } },
            });

        const result = await introspectServer('http://localhost:3000/mcp');

        expect(result.tools).toHaveLength(3);
        expect(result.tools[0].parameters).toEqual([]);
        expect(result.tools[1].parameters).toEqual([]);
        expect(result.tools[2].parameters).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
        mockAxiosInstance.post.mockRejectedValueOnce(
            new Error('Network error'),
        );

        await expect(
            introspectServer('http://localhost:3000/mcp'),
        ).rejects.toThrow('Network error');
    });
});
