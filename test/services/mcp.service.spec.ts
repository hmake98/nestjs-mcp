import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MCPService } from '../../src/services/mcp.service';
import { MCPRegistryService } from '../../src/services/mcp-registry.service';
import {
    MCPRequest,
    MCPModuleOptions,
    MCPToolDefinition,
    DiscoveredMCPResource,
    DiscoveredMCPPrompt,
} from '../../src/interfaces';
import {
    MCP_MODULE_OPTIONS,
    MCPMethod,
    MCPErrorCode,
} from '../../src/constants';

describe('MCPService', () => {
    let service: MCPService;
    let registryService: MCPRegistryService;
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
                MCPService,
                MCPRegistryService,
                {
                    provide: MCP_MODULE_OPTIONS,
                    useValue: mockOptions,
                },
            ],
        }).compile();

        service = module.get<MCPService>(MCPService);
        registryService = module.get<MCPRegistryService>(MCPRegistryService);
        jest.spyOn(Logger.prototype, 'log').mockImplementation();
        jest.spyOn(Logger.prototype, 'warn').mockImplementation();
        jest.spyOn(Logger.prototype, 'debug').mockImplementation();
        jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handleRequest', () => {
        it('should handle initialize request', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.INITIALIZE,
                params: {},
            };

            const response = await service.handleRequest(request);

            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(1);
            expect(response.result).toHaveProperty('protocolVersion');
            expect(response.result).toHaveProperty('capabilities');
            expect(response.result).toHaveProperty('serverInfo');
        });

        it('should handle ping request', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 2,
                method: MCPMethod.PING,
            };

            const response = await service.handleRequest(request);

            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(2);
            expect(response.result).toEqual({});
        });

        it('should return error for unknown method', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 3,
                method: 'unknown/method',
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.code).toBe(MCPErrorCode.METHOD_NOT_FOUND);
        });

        it('should handle errors gracefully', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 4,
                method: MCPMethod.TOOLS_CALL,
                params: { name: 'non-existent' },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
        });
    });

    describe('tools/list', () => {
        it('should list all registered tools', async () => {
            const tool: MCPToolDefinition = {
                name: 'test-tool',
                description: 'A test tool',
                parameters: [
                    {
                        name: 'param1',
                        type: 'string',
                        description: 'First parameter',
                        required: true,
                    },
                ],
                handler: async () => 'result',
            };

            registryService.registerTool(tool);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 5,
                method: MCPMethod.TOOLS_LIST,
            };

            const response = await service.handleRequest(request);

            expect(response.result).toHaveProperty('tools');
            const tools = (response.result as { tools: unknown[] }).tools;
            expect(tools).toHaveLength(1);
            expect(tools[0]).toMatchObject({
                name: 'test-tool',
                description: 'A test tool',
            });
        });

        it('should return empty list when no tools registered', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 6,
                method: MCPMethod.TOOLS_LIST,
            };

            const response = await service.handleRequest(request);

            expect(response.result).toHaveProperty('tools');
            const tools = (response.result as { tools: unknown[] }).tools;
            expect(tools).toHaveLength(0);
        });
    });

    describe('tools/call', () => {
        it('should call a tool successfully', async () => {
            const tool: MCPToolDefinition = {
                name: 'add',
                description: 'Add two numbers',
                parameters: [],
                handler: async (params) => {
                    const args = params as { a: number; b: number };
                    return args.a + args.b;
                },
            };

            registryService.registerTool(tool);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 7,
                method: MCPMethod.TOOLS_CALL,
                params: { name: 'add', arguments: { a: 2, b: 3 } },
            };

            const response = await service.handleRequest(request);

            expect(response.result).toBeDefined();
            expect(response.error).toBeUndefined();
        });

        it('should return error when tool name is missing', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 8,
                method: MCPMethod.TOOLS_CALL,
                params: { arguments: {} },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.code).toBe(MCPErrorCode.INVALID_PARAMS);
        });

        it('should return error when tool not found', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 9,
                method: MCPMethod.TOOLS_CALL,
                params: { name: 'non-existent', arguments: {} },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.code).toBe(MCPErrorCode.METHOD_NOT_FOUND);
        });

        it('should handle tool execution errors', async () => {
            const tool: MCPToolDefinition = {
                name: 'error-tool',
                description: 'A tool that errors',
                parameters: [],
                handler: async () => {
                    throw new Error('Tool error');
                },
            };

            registryService.registerTool(tool);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 10,
                method: MCPMethod.TOOLS_CALL,
                params: { name: 'error-tool', arguments: {} },
            };

            const response = await service.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as {
                isError?: boolean;
                content: unknown[];
            };
            expect(result.isError).toBe(true);
        });

        it('should normalize tool result', async () => {
            const tool: MCPToolDefinition = {
                name: 'string-tool',
                description: 'Returns a string',
                parameters: [],
                handler: async () => 'simple string',
            };

            registryService.registerTool(tool);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 11,
                method: MCPMethod.TOOLS_CALL,
                params: { name: 'string-tool', arguments: {} },
            };

            const response = await service.handleRequest(request);

            expect(response.result).toHaveProperty('content');
            const result = response.result as {
                content: Array<{ type: string; text: string }>;
            };
            expect(result.content[0].type).toBe('text');
            expect(result.content[0].text).toBe('simple string');
        });
    });

    describe('resources/list', () => {
        it('should list all registered resources', async () => {
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

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 12,
                method: MCPMethod.RESOURCES_LIST,
            };

            const response = await service.handleRequest(request);

            expect(response.result).toHaveProperty('resources');
            const resources = (response.result as { resources: unknown[] })
                .resources;
            expect(resources).toHaveLength(1);
            expect(resources[0]).toMatchObject({
                uri: 'file:///test.txt',
                name: 'Test Resource',
            });
        });

        it('should list template resources', async () => {
            const resource: DiscoveredMCPResource = {
                uriTemplate: 'file:///{filename}',
                name: 'Dynamic Resource',
                handler: async (vars) => ({
                    uri: `file:///${vars?.filename || 'default.txt'}`,
                    text: 'content',
                }),
            };

            registryService.registerResource(resource);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 13,
                method: MCPMethod.RESOURCES_LIST,
            };

            const response = await service.handleRequest(request);

            expect(response.result).toHaveProperty('resources');
            const resources = (response.result as { resources: unknown[] })
                .resources;
            expect(resources).toHaveLength(1);
            expect(resources[0]).toHaveProperty('uri');
        });
    });

    describe('resources/read', () => {
        it('should read a static resource', async () => {
            const resource: DiscoveredMCPResource = {
                uri: 'file:///test.txt',
                name: 'Test Resource',
                handler: async () => ({
                    uri: 'file:///test.txt',
                    mimeType: 'text/plain',
                    text: 'Hello World',
                }),
            };

            registryService.registerResource(resource);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 14,
                method: MCPMethod.RESOURCES_READ,
                params: { uri: 'file:///test.txt' },
            };

            const response = await service.handleRequest(request);

            expect(response.result).toHaveProperty('contents');
        });

        it('should return error when URI is missing', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 15,
                method: MCPMethod.RESOURCES_READ,
                params: {},
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.code).toBe(MCPErrorCode.INVALID_PARAMS);
        });

        it('should return error when resource not found', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 16,
                method: MCPMethod.RESOURCES_READ,
                params: { uri: 'file:///non-existent.txt' },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.code).toBe(MCPErrorCode.METHOD_NOT_FOUND);
        });

        it('should read a template resource', async () => {
            const resource: DiscoveredMCPResource = {
                uriTemplate: 'file:///{filename}',
                name: 'Dynamic Resource',
                handler: async (vars) => ({
                    uri: `file:///${vars?.filename || 'default.txt'}`,
                    text: `Content of ${vars?.filename || 'default'}`,
                }),
            };

            registryService.registerResource(resource);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 17,
                method: MCPMethod.RESOURCES_READ,
                params: { uri: 'file:///document.txt' },
            };

            const response = await service.handleRequest(request);

            expect(response.result).toHaveProperty('contents');
        });
    });

    describe('prompts/list', () => {
        it('should list all registered prompts', async () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'test-prompt',
                description: 'A test prompt',
                arguments: [{ name: 'arg1', description: 'Argument 1' }],
                handler: async () => [
                    { role: 'user', content: { type: 'text', text: 'test' } },
                ],
            };

            registryService.registerPrompt(prompt);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 18,
                method: MCPMethod.PROMPTS_LIST,
            };

            const response = await service.handleRequest(request);

            expect(response.result).toHaveProperty('prompts');
            const prompts = (response.result as { prompts: unknown[] }).prompts;
            expect(prompts).toHaveLength(1);
            expect(prompts[0]).toMatchObject({
                name: 'test-prompt',
                description: 'A test prompt',
            });
        });
    });

    describe('prompts/get', () => {
        it('should get a prompt successfully', async () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'test-prompt',
                description: 'A test prompt',
                handler: async (args) => [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Hello ${(args as { name?: string }).name || 'World'}`,
                        },
                    },
                ],
            };

            registryService.registerPrompt(prompt);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 19,
                method: MCPMethod.PROMPTS_GET,
                params: { name: 'test-prompt', arguments: { name: 'Alice' } },
            };

            const response = await service.handleRequest(request);

            expect(response.result).toHaveProperty('messages');
        });

        it('should return error when prompt name is missing', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 20,
                method: MCPMethod.PROMPTS_GET,
                params: {},
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.code).toBe(MCPErrorCode.INVALID_PARAMS);
        });

        it('should return error when prompt not found', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 21,
                method: MCPMethod.PROMPTS_GET,
                params: { name: 'non-existent' },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.code).toBe(MCPErrorCode.METHOD_NOT_FOUND);
        });
    });

    describe('isInitialized', () => {
        it('should return false initially', () => {
            expect(service.isInitialized()).toBe(false);
        });

        it('should return true after initialize request', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 22,
                method: MCPMethod.INITIALIZE,
                params: {},
            };

            await service.handleRequest(request);

            expect(service.isInitialized()).toBe(true);
        });
    });

    describe('error handling', () => {
        it('should handle custom error handler for request errors', async () => {
            const customErrorHandler = jest.fn((error: Error) => ({
                customMessage: error.message,
                timestamp: Date.now(),
            }));

            const moduleWithCustomHandler: TestingModule =
                await Test.createTestingModule({
                    providers: [
                        MCPService,
                        MCPRegistryService,
                        {
                            provide: MCP_MODULE_OPTIONS,
                            useValue: {
                                ...mockOptions,
                                errorHandler: customErrorHandler,
                            },
                        },
                    ],
                }).compile();

            const serviceWithHandler =
                moduleWithCustomHandler.get<MCPService>(MCPService);
            const registryWithHandler =
                moduleWithCustomHandler.get<MCPRegistryService>(
                    MCPRegistryService,
                );

            // Make registry throw an error
            jest.spyOn(registryWithHandler, 'getAllTools').mockImplementation(
                () => {
                    throw new Error('Registry error');
                },
            );

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 100,
                method: MCPMethod.TOOLS_LIST,
            };

            const response = await serviceWithHandler.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(customErrorHandler).toHaveBeenCalled();
        });

        it('should handle errors in custom error handler', async () => {
            const faultyErrorHandler = jest.fn(() => {
                throw new Error('Handler error');
            });

            const moduleWithFaultyHandler: TestingModule =
                await Test.createTestingModule({
                    providers: [
                        MCPService,
                        MCPRegistryService,
                        {
                            provide: MCP_MODULE_OPTIONS,
                            useValue: {
                                ...mockOptions,
                                errorHandler: faultyErrorHandler,
                            },
                        },
                    ],
                }).compile();

            const serviceWithFaultyHandler =
                moduleWithFaultyHandler.get<MCPService>(MCPService);
            const registryWithFaultyHandler =
                moduleWithFaultyHandler.get<MCPRegistryService>(
                    MCPRegistryService,
                );

            // Make registry throw an error
            jest.spyOn(
                registryWithFaultyHandler,
                'getAllResources',
            ).mockImplementation(() => {
                throw new Error('Registry error');
            });

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 101,
                method: MCPMethod.RESOURCES_LIST,
            };

            const response =
                await serviceWithFaultyHandler.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(Logger.prototype.error).toHaveBeenLastCalledWith(
                'Error in custom error handler:',
                expect.any(String),
                undefined,
            );
        });

        it('should handle non-Error exceptions', async () => {
            const tool: MCPToolDefinition = {
                name: 'string-error-tool',
                description: 'Tool that throws string',
                parameters: [],
                handler: async () => {
                    throw 'String error message';
                },
            };

            registryService.registerTool(tool);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 102,
                method: MCPMethod.TOOLS_CALL,
                params: { name: 'string-error-tool', arguments: {} },
            };

            const response = await service.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as {
                isError?: boolean;
                content?: unknown[];
            };
            expect(result.isError).toBe(true);
            expect(Array.isArray(result.content)).toBe(true);
        });
    });

    describe('content normalization', () => {
        it('should handle resource returning single content object', async () => {
            const resource: DiscoveredMCPResource = {
                uri: 'file:///single.txt',
                name: 'Single Resource',
                handler: async () => ({
                    uri: 'file:///single.txt',
                    text: 'single content',
                }),
            };

            registryService.registerResource(resource);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 200,
                method: MCPMethod.RESOURCES_READ,
                params: { uri: 'file:///single.txt' },
            };

            const response = await service.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as { contents: unknown[] };
            expect(Array.isArray(result.contents)).toBe(true);
            expect(result.contents).toHaveLength(1);
        });

        it('should handle prompt returning single message object', async () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'single-message-prompt',
                description: 'Returns single message',
                arguments: [],
                handler: async () => ({
                    role: 'user',
                    content: { type: 'text', text: 'single message' },
                }),
            };

            registryService.registerPrompt(prompt);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 201,
                method: MCPMethod.PROMPTS_GET,
                params: { name: 'single-message-prompt', arguments: {} },
            };

            const response = await service.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as { messages: unknown[] };
            expect(Array.isArray(result.messages)).toBe(true);
            expect(result.messages).toHaveLength(1);
        });
    });

    describe('request logging', () => {
        it('should handle requests without logging when disabled', async () => {
            const moduleWithoutLogging: TestingModule =
                await Test.createTestingModule({
                    providers: [
                        MCPService,
                        MCPRegistryService,
                        {
                            provide: MCP_MODULE_OPTIONS,
                            useValue: {
                                ...mockOptions,
                                enableLogging: false,
                            },
                        },
                    ],
                }).compile();

            const serviceWithoutLogging =
                moduleWithoutLogging.get<MCPService>(MCPService);

            jest.clearAllMocks();

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 300,
                method: MCPMethod.PING,
            };

            await serviceWithoutLogging.handleRequest(request);

            expect(Logger.prototype.debug).not.toHaveBeenCalled();
        });

        it('should log requests when logging is enabled', async () => {
            const moduleWithLogging: TestingModule =
                await Test.createTestingModule({
                    providers: [
                        MCPService,
                        MCPRegistryService,
                        {
                            provide: MCP_MODULE_OPTIONS,
                            useValue: {
                                ...mockOptions,
                                enableLogging: true,
                            },
                        },
                    ],
                }).compile();

            const serviceWithLogging =
                moduleWithLogging.get<MCPService>(MCPService);

            jest.clearAllMocks();

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 301,
                method: MCPMethod.PING,
            };

            await serviceWithLogging.handleRequest(request);

            expect(Logger.prototype.debug).toHaveBeenCalledWith(
                'Handling request: ping',
                undefined,
            );
        });
    });

    describe('getSDKServer', () => {
        it('should return null (placeholder for SDK server)', () => {
            const result = service.getSDKServer();
            expect(result).toBeNull();
        });
    });

    describe('error handling in request methods', () => {
        it('should handle errors in resources/read', async () => {
            const errorResource: DiscoveredMCPResource = {
                uri: 'file:///error.txt',
                name: 'Error Resource',
                handler: async () => {
                    throw new Error('Resource read failed');
                },
            };

            registryService.registerResource(errorResource);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 400,
                method: MCPMethod.RESOURCES_READ,
                params: { uri: 'file:///error.txt' },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.code).toBe(MCPErrorCode.INTERNAL_ERROR);
        });

        it('should handle errors in prompts/get', async () => {
            const errorPrompt: DiscoveredMCPPrompt = {
                name: 'error-prompt',
                description: 'Prompt that throws',
                handler: async () => {
                    throw new Error('Prompt execution failed');
                },
            };

            registryService.registerPrompt(errorPrompt);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 401,
                method: MCPMethod.PROMPTS_GET,
                params: { name: 'error-prompt', arguments: {} },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.code).toBe(MCPErrorCode.INTERNAL_ERROR);
        });
    });

    describe('normalizeToolResult', () => {
        it('should return MCPToolResult objects as-is', async () => {
            const tool: MCPToolDefinition = {
                name: 'object-result-tool',
                description: 'Tool that returns MCPToolResult',
                parameters: [],
                handler: async () => ({
                    content: [{ type: 'text' as const, text: 'result' }],
                    isError: false,
                }),
            };

            registryService.registerTool(tool);

            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 402,
                method: MCPMethod.TOOLS_CALL,
                params: { name: 'object-result-tool', arguments: {} },
            };

            const response = await service.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as { content: unknown[] };
            expect(result.content).toHaveLength(1);
        });
    });
});
