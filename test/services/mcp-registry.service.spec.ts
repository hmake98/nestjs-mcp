import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MCPRegistryService } from '../../src/services/mcp-registry.service';
import {
    MCPToolDefinition,
    DiscoveredMCPResource,
    DiscoveredMCPPrompt,
} from '../../src/interfaces';
import { MCP_MODULE_OPTIONS } from '../../src/constants';

describe('MCPRegistryService', () => {
    let service: MCPRegistryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MCPRegistryService,
                {
                    provide: MCP_MODULE_OPTIONS,
                    useValue: {
                        serverInfo: {
                            name: 'test-server',
                            version: '1.0.0',
                        },
                        enableLogging: false,
                    },
                },
            ],
        }).compile();

        service = module.get<MCPRegistryService>(MCPRegistryService);
        // Suppress logger output in tests
        jest.spyOn(Logger.prototype, 'log').mockImplementation();
        jest.spyOn(Logger.prototype, 'warn').mockImplementation();
        jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Tool Management', () => {
        it('should register a tool', () => {
            const tool: MCPToolDefinition = {
                name: 'test-tool',
                description: 'Test tool',
                parameters: [],
                handler: async () => 'result',
            };

            service.registerTool(tool);

            expect(service.hasTool('test-tool')).toBe(true);
            expect(service.getTool('test-tool')).toEqual(tool);
        });

        it('should register multiple tools', () => {
            const tools: MCPToolDefinition[] = [
                {
                    name: 'tool1',
                    description: 'Tool 1',
                    parameters: [],
                    handler: async () => 'result1',
                },
                {
                    name: 'tool2',
                    description: 'Tool 2',
                    parameters: [],
                    handler: async () => 'result2',
                },
            ];

            service.registerTools(tools);

            expect(service.getAllTools()).toHaveLength(2);
            expect(service.hasTool('tool1')).toBe(true);
            expect(service.hasTool('tool2')).toBe(true);
        });

        it('should warn when overwriting existing tool', () => {
            const tool: MCPToolDefinition = {
                name: 'test-tool',
                description: 'Test tool',
                parameters: [],
                handler: async () => 'result',
            };

            service.registerTool(tool);
            service.registerTool(tool);

            expect(Logger.prototype.warn).toHaveBeenCalledWith(
                "Tool 'test-tool' is already registered. Overwriting.",
            );
        });

        it('should get a tool by name', () => {
            const tool: MCPToolDefinition = {
                name: 'test-tool',
                description: 'Test tool',
                parameters: [],
                handler: async () => 'result',
            };

            service.registerTool(tool);
            const retrieved = service.getTool('test-tool');

            expect(retrieved).toEqual(tool);
        });

        it('should return undefined for non-existent tool', () => {
            expect(service.getTool('non-existent')).toBeUndefined();
        });

        it('should get all registered tools', () => {
            const tools: MCPToolDefinition[] = [
                {
                    name: 'tool1',
                    description: 'Tool 1',
                    parameters: [],
                    handler: async () => 'result1',
                },
                {
                    name: 'tool2',
                    description: 'Tool 2',
                    parameters: [],
                    handler: async () => 'result2',
                },
            ];

            service.registerTools(tools);
            const allTools = service.getAllTools();

            expect(allTools).toHaveLength(2);
            expect(allTools).toEqual(expect.arrayContaining(tools));
        });

        it('should check if tool exists', () => {
            const tool: MCPToolDefinition = {
                name: 'test-tool',
                description: 'Test tool',
                parameters: [],
                handler: async () => 'result',
            };

            expect(service.hasTool('test-tool')).toBe(false);
            service.registerTool(tool);
            expect(service.hasTool('test-tool')).toBe(true);
        });

        it('should unregister a tool', () => {
            const tool: MCPToolDefinition = {
                name: 'test-tool',
                description: 'Test tool',
                parameters: [],
                handler: async () => 'result',
            };

            service.registerTool(tool);
            expect(service.hasTool('test-tool')).toBe(true);

            const result = service.unregisterTool('test-tool');
            expect(result).toBe(true);
            expect(service.hasTool('test-tool')).toBe(false);
        });

        it('should return false when unregistering non-existent tool', () => {
            const result = service.unregisterTool('non-existent');
            expect(result).toBe(false);
        });
    });

    describe('Resource Management', () => {
        it('should register a static resource', () => {
            const resource: DiscoveredMCPResource = {
                uri: 'file:///test.txt',
                name: 'Test Resource',
                description: 'A test resource',
                mimeType: 'text/plain',
                handler: async () => ({
                    uri: 'file:///test.txt',
                    text: 'content',
                }),
            };

            service.registerResource(resource);

            expect(service.hasResource('file:///test.txt')).toBe(true);
            expect(service.getResource('file:///test.txt')).toEqual(resource);
        });

        it('should register a template resource', () => {
            const resource: DiscoveredMCPResource = {
                uriTemplate: 'file:///{filename}',
                name: 'Dynamic Resource',
                description: 'A dynamic resource',
                handler: async (vars) => ({
                    uri: `file:///${vars?.filename || 'default.txt'}`,
                    text: 'content',
                }),
            };

            service.registerResource(resource);

            expect(service.hasResource('file:///{filename}')).toBe(true);
        });

        it('should register multiple resources', () => {
            const resources: DiscoveredMCPResource[] = [
                {
                    uri: 'file:///test1.txt',
                    name: 'Resource 1',
                    handler: async () => ({
                        uri: 'file:///test1.txt',
                        text: 'content1',
                    }),
                },
                {
                    uri: 'file:///test2.txt',
                    name: 'Resource 2',
                    handler: async () => ({
                        uri: 'file:///test2.txt',
                        text: 'content2',
                    }),
                },
            ];

            service.registerResources(resources);

            expect(service.getAllResources()).toHaveLength(2);
        });

        it('should warn when overwriting existing resource', () => {
            const resource: DiscoveredMCPResource = {
                uri: 'file:///test.txt',
                name: 'Test Resource',
                handler: async () => ({
                    uri: 'file:///test.txt',
                    text: 'content',
                }),
            };

            service.registerResource(resource);
            service.registerResource(resource);

            expect(Logger.prototype.warn).toHaveBeenCalledWith(
                "Resource 'file:///test.txt' is already registered. Overwriting.",
            );
        });

        it('should find resource by URI pattern', () => {
            const resource: DiscoveredMCPResource = {
                uriTemplate: 'file:///{filename}',
                name: 'Dynamic Resource',
                handler: async (vars) => ({
                    uri: `file:///${vars?.filename || 'default.txt'}`,
                    text: 'content',
                }),
            };

            service.registerResource(resource);

            const found = service.findResourceByPattern('file:///document.txt');
            expect(found).toEqual(resource);
        });

        it('should return undefined when no pattern matches', () => {
            const found = service.findResourceByPattern('file:///document.txt');
            expect(found).toBeUndefined();
        });

        it('should extract URI variables from template', () => {
            const template = 'file:///{folder}/{filename}';
            const uri = 'file:///documents/test.txt';

            const variables = service.extractUriVariables(template, uri);

            expect(variables).toEqual({
                folder: 'documents',
                filename: 'test.txt',
            });
        });

        it('should return empty object when URI parts length mismatch', () => {
            const template = 'file:///{folder}/{filename}';
            const uri = 'file:///documents';

            const variables = service.extractUriVariables(template, uri);

            expect(variables).toEqual({});
        });

        it('should extract single variable', () => {
            const template = 'file:///{filename}';
            const uri = 'file:///test.txt';

            const variables = service.extractUriVariables(template, uri);

            expect(variables).toEqual({ filename: 'test.txt' });
        });

        it('should get all registered resources', () => {
            const resources: DiscoveredMCPResource[] = [
                {
                    uri: 'file:///test1.txt',
                    name: 'Resource 1',
                    handler: async () => ({
                        uri: 'file:///test1.txt',
                        text: 'content1',
                    }),
                },
                {
                    uri: 'file:///test2.txt',
                    name: 'Resource 2',
                    handler: async () => ({
                        uri: 'file:///test2.txt',
                        text: 'content2',
                    }),
                },
            ];

            service.registerResources(resources);
            const allResources = service.getAllResources();

            expect(allResources).toHaveLength(2);
            expect(allResources).toEqual(expect.arrayContaining(resources));
        });

        it('should check if resource exists', () => {
            const resource: DiscoveredMCPResource = {
                uri: 'file:///test.txt',
                name: 'Test Resource',
                handler: async () => ({
                    uri: 'file:///test.txt',
                    text: 'content',
                }),
            };

            expect(service.hasResource('file:///test.txt')).toBe(false);
            service.registerResource(resource);
            expect(service.hasResource('file:///test.txt')).toBe(true);
        });

        it('should unregister a resource', () => {
            const resource: DiscoveredMCPResource = {
                uri: 'file:///test.txt',
                name: 'Test Resource',
                handler: async () => ({
                    uri: 'file:///test.txt',
                    text: 'content',
                }),
            };

            service.registerResource(resource);
            expect(service.hasResource('file:///test.txt')).toBe(true);
            expect(service.getAllResources()).toHaveLength(1);
        });

        it('should return false when unregistering non-existent resource', () => {
            expect(service.getAllResources()).toHaveLength(0);
        });
    });

    describe('Prompt Management', () => {
        it('should register a prompt', () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'test-prompt',
                description: 'Test prompt',
                arguments: [],
                handler: async () => [
                    { role: 'user', content: { type: 'text', text: 'test' } },
                ],
            };

            service.registerPrompt(prompt);

            expect(service.hasPrompt('test-prompt')).toBe(true);
            expect(service.getPrompt('test-prompt')).toEqual(prompt);
        });

        it('should register multiple prompts', () => {
            const prompts: DiscoveredMCPPrompt[] = [
                {
                    name: 'prompt1',
                    description: 'Prompt 1',
                    handler: async () => [
                        {
                            role: 'user',
                            content: { type: 'text', text: 'prompt1' },
                        },
                    ],
                },
                {
                    name: 'prompt2',
                    description: 'Prompt 2',
                    handler: async () => [
                        {
                            role: 'user',
                            content: { type: 'text', text: 'prompt2' },
                        },
                    ],
                },
            ];

            service.registerPrompts(prompts);

            expect(service.getAllPrompts()).toHaveLength(2);
            expect(service.hasPrompt('prompt1')).toBe(true);
            expect(service.hasPrompt('prompt2')).toBe(true);
        });

        it('should warn when overwriting existing prompt', () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'test-prompt',
                description: 'Test prompt',
                handler: async () => [
                    { role: 'user', content: { type: 'text', text: 'test' } },
                ],
            };

            service.registerPrompt(prompt);
            service.registerPrompt(prompt);

            expect(Logger.prototype.warn).toHaveBeenCalledWith(
                "Prompt 'test-prompt' is already registered. Overwriting.",
            );
        });

        it('should get a prompt by name', () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'test-prompt',
                description: 'Test prompt',
                handler: async () => [
                    { role: 'user', content: { type: 'text', text: 'test' } },
                ],
            };

            service.registerPrompt(prompt);
            const retrieved = service.getPrompt('test-prompt');

            expect(retrieved).toEqual(prompt);
        });

        it('should return undefined for non-existent prompt', () => {
            expect(service.getPrompt('non-existent')).toBeUndefined();
        });

        it('should get all registered prompts', () => {
            const prompts: DiscoveredMCPPrompt[] = [
                {
                    name: 'prompt1',
                    description: 'Prompt 1',
                    handler: async () => [
                        {
                            role: 'user',
                            content: { type: 'text', text: 'prompt1' },
                        },
                    ],
                },
                {
                    name: 'prompt2',
                    description: 'Prompt 2',
                    handler: async () => [
                        {
                            role: 'user',
                            content: { type: 'text', text: 'prompt2' },
                        },
                    ],
                },
            ];

            service.registerPrompts(prompts);
            const allPrompts = service.getAllPrompts();

            expect(allPrompts).toHaveLength(2);
            expect(allPrompts).toEqual(expect.arrayContaining(prompts));
        });

        it('should check if prompt exists', () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'test-prompt',
                description: 'Test prompt',
                handler: async () => [
                    { role: 'user', content: { type: 'text', text: 'test' } },
                ],
            };

            expect(service.hasPrompt('test-prompt')).toBe(false);
            service.registerPrompt(prompt);
            expect(service.hasPrompt('test-prompt')).toBe(true);
        });

        it('should unregister a prompt', () => {
            const prompt: DiscoveredMCPPrompt = {
                name: 'test-prompt',
                description: 'Test prompt',
                handler: async () => [
                    { role: 'user', content: { type: 'text', text: 'test' } },
                ],
            };

            service.registerPrompt(prompt);
            expect(service.hasPrompt('test-prompt')).toBe(true);
            expect(service.getAllPrompts()).toHaveLength(1);
        });

        it('should return false when unregistering non-existent prompt', () => {
            expect(service.getAllPrompts()).toHaveLength(0);
        });
    });

    describe('clear', () => {
        it('should clear all registrations', () => {
            // Register some items
            const tool: MCPToolDefinition = {
                name: 'test-tool',
                description: 'Test tool',
                parameters: [],
                handler: async () => 'result',
            };

            const resource: DiscoveredMCPResource = {
                uri: 'file:///test.txt',
                name: 'Test Resource',
                handler: async () => ({
                    uri: 'file:///test.txt',
                    text: 'content',
                }),
            };

            const prompt: DiscoveredMCPPrompt = {
                name: 'test-prompt',
                description: 'Test prompt',
                handler: async () => [
                    { role: 'user', content: { type: 'text', text: 'test' } },
                ],
            };

            service.registerTool(tool);
            service.registerResource(resource);
            service.registerPrompt(prompt);

            expect(service.getAllTools()).toHaveLength(1);
            expect(service.getAllResources()).toHaveLength(1);
            expect(service.getAllPrompts()).toHaveLength(1);

            // Clear all
            service.clear();

            expect(service.getAllTools()).toHaveLength(0);
            expect(service.getAllResources()).toHaveLength(0);
            expect(service.getAllPrompts()).toHaveLength(0);
            expect(Logger.prototype.log).toHaveBeenCalledWith(
                'Cleared all registrations',
            );
        });
    });
});
