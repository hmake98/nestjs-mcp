import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MCPSDKService } from '../../src/services/mcp-sdk.service';
import { MCPRegistryService } from '../../src/services/mcp-registry.service';
import {
    MCPModuleOptions,
    MCPToolDefinition,
    DiscoveredMCPResource,
    DiscoveredMCPPrompt,
} from '../../src/interfaces';
import { MCP_MODULE_OPTIONS } from '../../src/constants';

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
    McpServer: jest.fn().mockImplementation(() => ({
        registerTool: jest.fn(),
        registerResource: jest.fn(),
        registerPrompt: jest.fn(),
        connect: jest.fn(),
        close: jest.fn(),
    })),
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
    StdioServerTransport: jest.fn(),
}));

describe('MCPSDKService', () => {
    let service: MCPSDKService;
    let registryService: MCPRegistryService;
    // Mock server object - using any for test flexibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockMcpServer: any;
    const mockOptions: MCPModuleOptions = {
        serverInfo: {
            name: 'Test Server',
            version: '1.0.0',
            capabilities: {
                tools: {},
                resources: {},
                prompts: {},
            },
        },
        enableLogging: false,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MCPSDKService,
                MCPRegistryService,
                {
                    provide: MCP_MODULE_OPTIONS,
                    useValue: mockOptions,
                },
            ],
        }).compile();

        service = module.get<MCPSDKService>(MCPSDKService);
        registryService = module.get<MCPRegistryService>(MCPRegistryService);
        mockMcpServer = service.getServer();
        jest.spyOn(Logger.prototype, 'log').mockImplementation();
        jest.spyOn(Logger.prototype, 'warn').mockImplementation();
        jest.spyOn(Logger.prototype, 'debug').mockImplementation();
        jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize MCP server on construction', () => {
            expect(service).toBeDefined();
        });

        it('should create server with correct configuration', () => {
            expect(service.getServer()).toBeDefined();
        });
    });

    describe('registerDiscoveredItems', () => {
        it('should register all tools, resources, and prompts', () => {
            const tool: MCPToolDefinition = {
                name: 'test-tool',
                description: 'Test tool',
                parameters: [],
                handler: async () => 'result',
            };

            registryService.registerTool(tool);

            service.registerDiscoveredItems();

            expect(Logger.prototype.log).toHaveBeenCalledWith(
                'All discovered items registered with MCP server',
            );
        });

        it('should not register items twice', () => {
            service.registerDiscoveredItems();
            jest.clearAllMocks();

            service.registerDiscoveredItems();

            expect(Logger.prototype.warn).toHaveBeenCalledWith(
                'Items already registered, skipping',
            );
        });

        it('should register tools with SDK', () => {
            const tool: MCPToolDefinition = {
                name: 'test-tool',
                description: 'Test tool',
                parameters: [
                    {
                        name: 'param1',
                        type: 'string',
                        required: true,
                    },
                ],
                handler: async () => 'result',
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerTool).toHaveBeenCalled();
        });

        it('should register static resources with SDK', () => {
            const resource: DiscoveredMCPResource = {
                uri: 'file:///test.txt',
                name: 'Test Resource',
                description: 'A test resource',
                handler: async () => ({
                    uri: 'file:///test.txt',
                    text: 'content',
                }),
            };

            registryService.registerResource(resource);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerResource).toHaveBeenCalled();
        });

        it('should warn about template resources not being fully supported', () => {
            const resource: DiscoveredMCPResource = {
                uriTemplate: 'file:///{filename}',
                name: 'Dynamic Resource',
                handler: async (vars) => ({
                    uri: `file:///${vars?.filename || 'default.txt'}`,
                    text: 'content',
                }),
            };

            registryService.registerResource(resource);
            service.registerDiscoveredItems();

            expect(Logger.prototype.warn).toHaveBeenCalledWith(
                'Template resources not fully supported yet: Dynamic Resource',
            );
        });

        it('should register prompts with SDK', () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'test-prompt',
                description: 'Test prompt',
                arguments: [{ name: 'arg1', description: 'Argument 1' }],
                handler: async () => [
                    { role: 'user', content: { type: 'text', text: 'test' } },
                ],
            };

            registryService.registerPrompt(prompt);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerPrompt).toHaveBeenCalled();
        });
    });

    describe('getServer', () => {
        it('should return the SDK server instance', () => {
            const server = service.getServer();
            expect(server).toBeDefined();
        });
    });

    describe('connectStdio', () => {
        it('should connect to stdio transport', async () => {
            await service.connectStdio();

            expect(Logger.prototype.log).toHaveBeenCalledWith(
                'MCP server connected to stdio transport',
            );
        });

        it('should register discovered items before connecting', async () => {
            const tool: MCPToolDefinition = {
                name: 'test-tool',
                description: 'Test tool',
                parameters: [],
                handler: async () => 'result',
            };

            registryService.registerTool(tool);

            await service.connectStdio();

            expect(Logger.prototype.log).toHaveBeenCalledWith(
                'All discovered items registered with MCP server',
            );
        });
    });

    describe('onModuleDestroy', () => {
        it('should close server when transport is connected', async () => {
            await service.connectStdio();
            await service.onModuleDestroy();

            expect(Logger.prototype.log).toHaveBeenCalledWith(
                'MCP server closed',
            );
        });

        it('should not log when transport is not connected', async () => {
            jest.clearAllMocks();
            await service.onModuleDestroy();

            expect(Logger.prototype.log).not.toHaveBeenCalledWith(
                'MCP server closed',
            );
        });
    });

    describe('parameter schema building', () => {
        it('should handle all parameter types', () => {
            const tool: MCPToolDefinition = {
                name: 'complex-tool',
                description: 'Complex tool',
                parameters: [
                    {
                        name: 'str',
                        type: 'string',
                        description: 'String param',
                    },
                    {
                        name: 'num',
                        type: 'number',
                        description: 'Number param',
                    },
                    {
                        name: 'bool',
                        type: 'boolean',
                        description: 'Boolean param',
                    },
                    { name: 'arr', type: 'array', description: 'Array param' },
                    {
                        name: 'obj',
                        type: 'object',
                        description: 'Object param',
                    },
                ],
                handler: async () => 'result',
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerTool).toHaveBeenCalled();
        });

        it('should handle optional parameters', () => {
            const tool: MCPToolDefinition = {
                name: 'optional-tool',
                description: 'Tool with optional params',
                parameters: [
                    { name: 'required', type: 'string', required: true },
                    { name: 'optional', type: 'string', required: false },
                ],
                handler: async () => 'result',
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerTool).toHaveBeenCalled();
        });

        it('should handle default values', () => {
            const tool: MCPToolDefinition = {
                name: 'default-tool',
                description: 'Tool with defaults',
                parameters: [
                    { name: 'param', type: 'string', default: 'default-value' },
                ],
                handler: async () => 'result',
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerTool).toHaveBeenCalled();
        });

        it('should handle tool handler errors', async () => {
            const tool: MCPToolDefinition = {
                name: 'error-tool',
                description: 'Tool that throws error',
                parameters: [],
                handler: async () => {
                    throw new Error('Tool execution failed');
                },
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            // The error handling happens inside the SDK registration callback
            // We can verify it was registered
            expect(mockMcpServer.registerTool).toHaveBeenCalled();
        });

        it('should handle non-Error exceptions in tool handlers', async () => {
            const tool: MCPToolDefinition = {
                name: 'string-error-tool',
                description: 'Tool that throws string',
                parameters: [],
                handler: async () => {
                    throw 'String error';
                },
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerTool).toHaveBeenCalled();
        });

        it('should handle resources returning arrays', async () => {
            const resource: DiscoveredMCPResource = {
                uri: 'file:///multi.txt',
                name: 'Multi Resource',
                description: 'Resource returning array',
                handler: async () => [
                    { uri: 'file:///file1.txt', text: 'content1' },
                    { uri: 'file:///file2.txt', text: 'content2' },
                ],
            };

            registryService.registerResource(resource);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerResource).toHaveBeenCalled();
        });

        it('should handle prompts returning arrays', async () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'multi-prompt',
                description: 'Prompt returning array',
                arguments: [],
                handler: async () => [
                    {
                        role: 'user',
                        content: { type: 'text', text: 'message1' },
                    },
                    {
                        role: 'assistant',
                        content: { type: 'text', text: 'message2' },
                    },
                ],
            };

            registryService.registerPrompt(prompt);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerPrompt).toHaveBeenCalled();
        });

        it('should handle prompts with no arguments schema', () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'no-args-prompt',
                description: 'Prompt without arguments',
                handler: async () => [
                    { role: 'user', content: { type: 'text', text: 'test' } },
                ],
            };

            registryService.registerPrompt(prompt);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerPrompt).toHaveBeenCalled();
        });

        it('should handle tools with empty parameters', () => {
            const tool: MCPToolDefinition = {
                name: 'no-params-tool',
                description: 'Tool without parameters',
                parameters: [],
                handler: async () => 'result',
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerTool).toHaveBeenCalled();
        });
    });

    describe('tool handler execution', () => {
        it('should invoke tool handler and return normalized result', async () => {
            const tool: MCPToolDefinition = {
                name: 'exec-tool',
                description: 'Executable tool',
                parameters: [],
                handler: async () => 'success result',
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            // Get the registered handler callback
            const registerCall = mockMcpServer.registerTool.mock.calls[0];
            const handlerCallback = registerCall[2];

            // Execute the handler
            const result = await handlerCallback({}, {});

            expect(result).toEqual({
                content: [{ type: 'text', text: 'success result' }],
            });
        });

        it('should handle tool handler throwing Error', async () => {
            const tool: MCPToolDefinition = {
                name: 'error-exec-tool',
                description: 'Tool that throws',
                parameters: [],
                handler: async () => {
                    throw new Error('Execution failed');
                },
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerTool.mock.calls[0];
            const handlerCallback = registerCall[2];

            const result = await handlerCallback({}, {});

            expect(result).toEqual({
                content: [{ type: 'text', text: 'Error: Execution failed' }],
                isError: true,
            });
        });

        it('should handle tool handler throwing non-Error', async () => {
            const tool: MCPToolDefinition = {
                name: 'string-error-exec-tool',
                description: 'Tool that throws string',
                parameters: [],
                handler: async () => {
                    throw 'String error message';
                },
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerTool.mock.calls[0];
            const handlerCallback = registerCall[2];

            const result = await handlerCallback({}, {});

            expect(result).toEqual({
                content: [
                    { type: 'text', text: 'Error: String error message' },
                ],
                isError: true,
            });
        });

        it('should handle tool returning object result', async () => {
            const tool: MCPToolDefinition = {
                name: 'object-tool',
                description: 'Tool returning object',
                parameters: [],
                handler: async () => ({ key: 'value', nested: { data: 123 } }),
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerTool.mock.calls[0];
            const handlerCallback = registerCall[2];

            const result = await handlerCallback({}, {});

            expect(result).toEqual({
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            key: 'value',
                            nested: { data: 123 },
                        }),
                    },
                ],
            });
        });

        it('should handle tool returning array result', async () => {
            const tool: MCPToolDefinition = {
                name: 'array-tool',
                description: 'Tool returning array',
                parameters: [],
                handler: async () => [1, 2, 3],
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerTool.mock.calls[0];
            const handlerCallback = registerCall[2];

            const result = await handlerCallback({}, {});

            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify([1, 2, 3]) }],
            });
        });

        it('should handle tool returning formatted content result', async () => {
            const tool: MCPToolDefinition = {
                name: 'formatted-tool',
                description: 'Tool returning formatted content',
                parameters: [],
                handler: async () => ({
                    content: [{ type: 'text', text: 'formatted response' }],
                }),
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerTool.mock.calls[0];
            const handlerCallback = registerCall[2];

            const result = await handlerCallback({}, {});

            expect(result).toEqual({
                content: [{ type: 'text', text: 'formatted response' }],
            });
        });

        it('should handle tool returning formatted content with isError', async () => {
            const tool: MCPToolDefinition = {
                name: 'error-content-tool',
                description: 'Tool returning error content',
                parameters: [],
                handler: async () => ({
                    content: [{ type: 'text', text: 'error message' }],
                    isError: true,
                }),
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerTool.mock.calls[0];
            const handlerCallback = registerCall[2];

            const result = await handlerCallback({}, {});

            expect(result).toEqual({
                content: [{ type: 'text', text: 'error message' }],
                isError: true,
            });
        });

        it('should handle tool handler with null args', async () => {
            let receivedArgs: unknown;
            const tool: MCPToolDefinition = {
                name: 'null-args-tool',
                description: 'Tool that receives null args',
                parameters: [],
                handler: async (args) => {
                    receivedArgs = args;
                    return 'success';
                },
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerTool.mock.calls[0];
            const handlerCallback = registerCall[2];

            const result = await handlerCallback(null, {});

            expect(receivedArgs).toEqual({});
            expect(result).toEqual({
                content: [{ type: 'text', text: 'success' }],
            });
        });

        it('should handle tool handler with undefined args', async () => {
            let receivedArgs: unknown;
            const tool: MCPToolDefinition = {
                name: 'undefined-args-tool',
                description: 'Tool that receives undefined args',
                parameters: [],
                handler: async (args) => {
                    receivedArgs = args;
                    return 'success';
                },
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerTool.mock.calls[0];
            const handlerCallback = registerCall[2];

            const result = await handlerCallback(undefined, {});

            expect(receivedArgs).toEqual({});
            expect(result).toEqual({
                content: [{ type: 'text', text: 'success' }],
            });
        });
    });

    describe('resource handler execution', () => {
        it('should invoke resource handler returning single content', async () => {
            const resource: DiscoveredMCPResource = {
                uri: 'file:///single.txt',
                name: 'Single Resource',
                description: 'Resource returning single content',
                handler: async () => ({
                    uri: 'file:///single.txt',
                    text: 'single content',
                }),
            };

            registryService.registerResource(resource);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerResource.mock.calls[0];
            const handlerCallback = registerCall[3];

            const result = await handlerCallback('file:///single.txt', {});

            expect(result.contents).toHaveLength(1);
            expect(result.contents[0]).toEqual({
                uri: 'file:///single.txt',
                text: 'single content',
            });
        });

        it('should invoke resource handler returning array content', async () => {
            const resource: DiscoveredMCPResource = {
                uri: 'file:///multi.txt',
                name: 'Multi Resource',
                description: 'Resource returning array',
                handler: async () => [
                    { uri: 'file:///file1.txt', text: 'content1' },
                    { uri: 'file:///file2.txt', text: 'content2' },
                ],
            };

            registryService.registerResource(resource);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerResource.mock.calls[0];
            const handlerCallback = registerCall[3];

            const result = await handlerCallback('file:///multi.txt', {});

            expect(result.contents).toHaveLength(2);
        });
    });

    describe('prompt handler execution', () => {
        it('should invoke prompt handler returning single message', async () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'single-message-prompt',
                description: 'Prompt returning single message',
                handler: async () => ({
                    role: 'user',
                    content: { type: 'text', text: 'single message' },
                }),
            };

            registryService.registerPrompt(prompt);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerPrompt.mock.calls[0];
            const handlerCallback = registerCall[2];

            const result = await handlerCallback({}, {});

            expect(result.messages).toHaveLength(1);
            expect(result.messages[0]).toEqual({
                role: 'user',
                content: { type: 'text', text: 'single message' },
            });
        });

        it('should invoke prompt handler returning array of messages', async () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'multi-message-prompt',
                description: 'Prompt returning multiple messages',
                handler: async () => [
                    {
                        role: 'user',
                        content: { type: 'text', text: 'question' },
                    },
                    {
                        role: 'assistant',
                        content: { type: 'text', text: 'answer' },
                    },
                ],
            };

            registryService.registerPrompt(prompt);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerPrompt.mock.calls[0];
            const handlerCallback = registerCall[2];

            const result = await handlerCallback({}, {});

            expect(result.messages).toHaveLength(2);
        });

        it('should handle prompts with required arguments', () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'required-args-prompt',
                description: 'Prompt with required arguments',
                arguments: [
                    {
                        name: 'arg1',
                        description: 'Required arg',
                        required: true,
                    },
                    {
                        name: 'arg2',
                        description: 'Optional arg',
                        required: false,
                    },
                ],
                handler: async () => [
                    { role: 'user', content: { type: 'text', text: 'test' } },
                ],
            };

            registryService.registerPrompt(prompt);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerPrompt).toHaveBeenCalled();
        });

        it('should handle prompts with arguments without descriptions', () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'no-desc-args-prompt',
                description: 'Prompt with args without descriptions',
                arguments: [
                    { name: 'arg1' },
                    { name: 'arg2', required: false },
                ],
                handler: async () => [
                    { role: 'user', content: { type: 'text', text: 'test' } },
                ],
            };

            registryService.registerPrompt(prompt);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerPrompt).toHaveBeenCalled();
        });

        it('should handle prompt handler with null args', async () => {
            let receivedArgs: unknown;
            const prompt: DiscoveredMCPPrompt = {
                name: 'null-args-prompt',
                description: 'Prompt that receives null args',
                handler: async (args) => {
                    receivedArgs = args;
                    return [
                        {
                            role: 'user',
                            content: { type: 'text', text: 'message' },
                        },
                    ];
                },
            };

            registryService.registerPrompt(prompt);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerPrompt.mock.calls[0];
            const handlerCallback = registerCall[2];

            const result = await handlerCallback(null, {});

            expect(receivedArgs).toEqual({});
            expect(result.messages).toHaveLength(1);
        });

        it('should handle prompt handler with undefined args', async () => {
            let receivedArgs: unknown;
            const prompt: DiscoveredMCPPrompt = {
                name: 'undefined-args-prompt',
                description: 'Prompt that receives undefined args',
                handler: async (args) => {
                    receivedArgs = args;
                    return [
                        {
                            role: 'user',
                            content: { type: 'text', text: 'message' },
                        },
                    ];
                },
            };

            registryService.registerPrompt(prompt);
            service.registerDiscoveredItems();

            const registerCall = mockMcpServer.registerPrompt.mock.calls[0];
            const handlerCallback = registerCall[2];

            const result = await handlerCallback(undefined, {});

            expect(receivedArgs).toEqual({});
            expect(result.messages).toHaveLength(1);
        });
    });

    describe('parameter schema edge cases', () => {
        it('should handle parameters without descriptions', () => {
            const tool: MCPToolDefinition = {
                name: 'no-desc-tool',
                description: 'Tool with params without descriptions',
                parameters: [
                    { name: 'param1', type: 'string' },
                    { name: 'param2', type: 'number' },
                ],
                handler: async () => 'result',
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerTool).toHaveBeenCalled();
        });

        it('should handle unknown parameter type falling back to any', () => {
            const tool: MCPToolDefinition = {
                name: 'unknown-type-tool',
                description: 'Tool with unknown param type',
                parameters: [
                    { name: 'param1', type: 'unknown' as never },
                    { name: 'param2', type: 'custom' as never },
                ],
                handler: async () => 'result',
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerTool).toHaveBeenCalled();
        });

        it('should handle parameters with all options', () => {
            const tool: MCPToolDefinition = {
                name: 'full-options-tool',
                description: 'Tool with all param options',
                parameters: [
                    {
                        name: 'param1',
                        type: 'string',
                        description: 'A string param',
                        required: false,
                        default: 'default-value',
                    },
                ],
                handler: async () => 'result',
            };

            registryService.registerTool(tool);
            service.registerDiscoveredItems();

            expect(mockMcpServer.registerTool).toHaveBeenCalled();
        });
    });

    describe('initialization with different options', () => {
        it('should initialize with default capabilities when not provided', async () => {
            const optionsWithoutCapabilities: MCPModuleOptions = {
                serverInfo: {
                    name: 'Test Server',
                    version: '1.0.0',
                },
                enableLogging: false,
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    MCPSDKService,
                    MCPRegistryService,
                    {
                        provide: MCP_MODULE_OPTIONS,
                        useValue: optionsWithoutCapabilities,
                    },
                ],
            }).compile();

            const serviceWithDefaultCaps =
                module.get<MCPSDKService>(MCPSDKService);

            expect(serviceWithDefaultCaps.getServer()).toBeDefined();
        });
    });
});
