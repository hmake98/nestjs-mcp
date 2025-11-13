import { Test, TestingModule } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { MCPModule } from '../../src/modules/mcp.module';
import { MCPTool, MCPResource, MCPPrompt } from '../../src/decorators';
import { MCPService } from '../../src/services/mcp.service';
import { MCPRegistryService } from '../../src/services/mcp-registry.service';
import { MCPRequest } from '../../src/interfaces';

/**
 * Test service with versioned and deprecated tools, resources, and prompts
 */
@Injectable()
class VersionedTestService {
    // @ts-expect-error - Decorator type compatibility
    @MCPTool({
        name: 'current-tool',
        description: 'A current tool without deprecation',
        schema: z.object({ input: z.string() }),
        version: '2.0.0',
    })
    async currentTool({ input }: { input: string }) {
        return { result: `Processed: ${input}` };
    }

    // @ts-expect-error - Decorator type compatibility
    @MCPTool({
        name: 'deprecated-tool',
        description: 'A deprecated tool',
        schema: z.object({ value: z.number() }),
        version: '1.0.0',
        deprecation: {
            deprecated: true,
            message: 'This tool is no longer maintained',
            since: '1.5.0',
            removeIn: '3.0.0',
            replacedBy: 'current-tool',
        },
    })
    async deprecatedTool({ value }: { value: number }) {
        return { result: value * 2 };
    }

    // @ts-expect-error - Decorator type compatibility
    @MCPResource({
        uri: 'file://current-resource',
        name: 'Current Resource',
        description: 'A current resource',
        version: '1.2.0',
    })
    async getCurrentResource() {
        return {
            uri: 'file://current-resource',
            mimeType: 'text/plain',
            text: 'Current resource content',
        };
    }

    // @ts-expect-error - Decorator type compatibility
    @MCPResource({
        uri: 'file://deprecated-resource',
        name: 'Deprecated Resource',
        description: 'A deprecated resource',
        version: '1.0.0',
        deprecation: {
            deprecated: true,
            message: 'Resource moved',
            since: '1.1.0',
            replacedBy: 'file://current-resource',
        },
    })
    async getDeprecatedResource() {
        return {
            uri: 'file://deprecated-resource',
            mimeType: 'text/plain',
            text: 'Deprecated resource content',
        };
    }

    // @ts-expect-error - Decorator type compatibility
    @MCPPrompt({
        name: 'current-prompt',
        description: 'A current prompt',
        schema: z.object({ topic: z.string() }),
        version: '2.1.0',
    })
    async getCurrentPrompt({ topic }: { topic: string }) {
        return [
            {
                role: 'user' as const,
                content: {
                    type: 'text' as const,
                    text: `Tell me about ${topic}`,
                },
            },
        ];
    }

    // @ts-expect-error - Decorator type compatibility
    @MCPPrompt({
        name: 'deprecated-prompt',
        description: 'A deprecated prompt template',
        schema: z.object({ subject: z.string() }),
        version: '1.0.0',
        deprecation: {
            deprecated: true,
            message: 'Use current-prompt instead',
            since: '2.0.0',
            removeIn: '3.0.0',
            replacedBy: 'current-prompt',
        },
    })
    async getDeprecatedPrompt({ subject }: { subject: string }) {
        return [
            {
                role: 'user' as const,
                content: {
                    type: 'text' as const,
                    text: `What is ${subject}?`,
                },
            },
        ];
    }
}

describe('Versioning & Deprecation Support', () => {
    let module: TestingModule;
    let mcpService: MCPService;
    let registryService: MCPRegistryService;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                MCPModule.forRoot({
                    serverInfo: {
                        name: 'versioning-test-server',
                        version: '1.0.0',
                    },
                    enableLogging: false,
                }),
            ],
            providers: [VersionedTestService],
        }).compile();

        mcpService = module.get<MCPService>(MCPService);
        registryService = module.get<MCPRegistryService>(MCPRegistryService);
        await module.init();
    });

    afterEach(async () => {
        await module.close();
    });

    describe('Tool Versioning and Deprecation', () => {
        it('should include version in tools/list response for current tool', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/list',
            };

            const response = await mcpService.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as {
                tools: Array<{
                    name: string;
                    version?: string;
                    deprecated?: boolean;
                }>;
            };

            const currentTool = result.tools.find(
                (t) => t.name === 'current-tool',
            );
            expect(currentTool).toBeDefined();
            expect(currentTool?.version).toBe('2.0.0');
            expect(currentTool?.deprecated).toBeUndefined();
        });

        it('should include deprecation info in tools/list response for deprecated tool', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/list',
            };

            const response = await mcpService.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as {
                tools: Array<{
                    name: string;
                    version?: string;
                    deprecated?: boolean;
                    deprecationMessage?: string;
                }>;
            };

            const deprecatedTool = result.tools.find(
                (t) => t.name === 'deprecated-tool',
            );
            expect(deprecatedTool).toBeDefined();
            expect(deprecatedTool?.version).toBe('1.0.0');
            expect(deprecatedTool?.deprecated).toBe(true);
            expect(deprecatedTool?.deprecationMessage).toContain(
                'no longer maintained',
            );
            expect(deprecatedTool?.deprecationMessage).toContain(
                'Deprecated since 1.5.0',
            );
            expect(deprecatedTool?.deprecationMessage).toContain(
                'Will be removed in 3.0.0',
            );
            expect(deprecatedTool?.deprecationMessage).toContain(
                "Use 'current-tool' instead",
            );
        });

        it('should log warning when calling deprecated tool', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/call',
                params: {
                    name: 'deprecated-tool',
                    arguments: { value: 5 },
                },
            };

            // @ts-expect-error - Access private logger for testing
            const loggerWarnSpy = jest.spyOn(mcpService.logger, 'warn');

            const response = await mcpService.handleRequest(request);

            expect(response.result).toBeDefined();
            expect(loggerWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining("Tool 'deprecated-tool' is deprecated"),
            );
        });

        it('should still execute deprecated tool correctly', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/call',
                params: {
                    name: 'deprecated-tool',
                    arguments: { value: 5 },
                },
            };

            const response = await mcpService.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as {
                content: Array<{ type: string; text: string }>;
            };
            expect(result.content[0].text).toContain('"result":10');
        });
    });

    describe('Resource Versioning and Deprecation', () => {
        it('should include version in resources/list response for current resource', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'resources/list',
            };

            const response = await mcpService.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as {
                resources: Array<{
                    uri: string;
                    name: string;
                    version?: string;
                    deprecated?: boolean;
                }>;
            };

            const currentResource = result.resources.find(
                (r) => r.uri === 'file://current-resource',
            );
            expect(currentResource).toBeDefined();
            expect(currentResource?.version).toBe('1.2.0');
            expect(currentResource?.deprecated).toBeUndefined();
        });

        it('should include deprecation info in resources/list response', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'resources/list',
            };

            const response = await mcpService.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as {
                resources: Array<{
                    uri: string;
                    version?: string;
                    deprecated?: boolean;
                    deprecationMessage?: string;
                }>;
            };

            const deprecatedResource = result.resources.find(
                (r) => r.uri === 'file://deprecated-resource',
            );
            expect(deprecatedResource).toBeDefined();
            expect(deprecatedResource?.version).toBe('1.0.0');
            expect(deprecatedResource?.deprecated).toBe(true);
            expect(deprecatedResource?.deprecationMessage).toContain(
                'Resource moved',
            );
            expect(deprecatedResource?.deprecationMessage).toContain(
                'Deprecated since 1.1.0',
            );
        });

        it('should log warning when reading deprecated resource', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'resources/read',
                params: {
                    uri: 'file://deprecated-resource',
                },
            };

            // @ts-expect-error - Access private logger for testing
            const loggerWarnSpy = jest.spyOn(mcpService.logger, 'warn');

            const response = await mcpService.handleRequest(request);

            expect(response.result).toBeDefined();
            expect(loggerWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Resource 'file://deprecated-resource' is deprecated",
                ),
            );
        });
    });

    describe('Prompt Versioning and Deprecation', () => {
        it('should include version in prompts/list response for current prompt', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'prompts/list',
            };

            const response = await mcpService.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as {
                prompts: Array<{
                    name: string;
                    version?: string;
                    deprecated?: boolean;
                }>;
            };

            const currentPrompt = result.prompts.find(
                (p) => p.name === 'current-prompt',
            );
            expect(currentPrompt).toBeDefined();
            expect(currentPrompt?.version).toBe('2.1.0');
            expect(currentPrompt?.deprecated).toBeUndefined();
        });

        it('should include deprecation info in prompts/list response', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'prompts/list',
            };

            const response = await mcpService.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as {
                prompts: Array<{
                    name: string;
                    version?: string;
                    deprecated?: boolean;
                    deprecationMessage?: string;
                }>;
            };

            const deprecatedPrompt = result.prompts.find(
                (p) => p.name === 'deprecated-prompt',
            );
            expect(deprecatedPrompt).toBeDefined();
            expect(deprecatedPrompt?.version).toBe('1.0.0');
            expect(deprecatedPrompt?.deprecated).toBe(true);
            expect(deprecatedPrompt?.deprecationMessage).toContain(
                'Use current-prompt instead',
            );
            expect(deprecatedPrompt?.deprecationMessage).toContain(
                'Will be removed in 3.0.0',
            );
        });

        it('should log warning when getting deprecated prompt', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'prompts/get',
                params: {
                    name: 'deprecated-prompt',
                    arguments: { subject: 'AI' },
                },
            };

            // @ts-expect-error - Access private logger for testing
            const loggerWarnSpy = jest.spyOn(mcpService.logger, 'warn');

            const response = await mcpService.handleRequest(request);

            expect(response.result).toBeDefined();
            expect(loggerWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Prompt 'deprecated-prompt' is deprecated",
                ),
            );
        });

        it('should still execute deprecated prompt correctly', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'prompts/get',
                params: {
                    name: 'deprecated-prompt',
                    arguments: { subject: 'AI' },
                },
            };

            const response = await mcpService.handleRequest(request);

            expect(response.result).toBeDefined();
            const result = response.result as {
                messages: Array<{
                    role: string;
                    content: { type: string; text: string };
                }>;
            };
            expect(result.messages[0].content.text).toBe('What is AI?');
        });
    });

    describe('Registry Integration', () => {
        it('should store version and deprecation info in tool registry', () => {
            const tool = registryService.getTool('deprecated-tool');
            expect(tool).toBeDefined();
            expect(tool?.version).toBe('1.0.0');
            expect(tool?.deprecated).toBe(true);
            expect(tool?.deprecationMessage).toBeDefined();
        });

        it('should store version and deprecation info in resource registry', () => {
            const resource = registryService.getResource(
                'file://deprecated-resource',
            );
            expect(resource).toBeDefined();
            expect(resource?.version).toBe('1.0.0');
            expect(resource?.deprecated).toBe(true);
            expect(resource?.deprecationMessage).toBeDefined();
        });

        it('should store version and deprecation info in prompt registry', () => {
            const prompt = registryService.getPrompt('deprecated-prompt');
            expect(prompt).toBeDefined();
            expect(prompt?.version).toBe('1.0.0');
            expect(prompt?.deprecated).toBe(true);
            expect(prompt?.deprecationMessage).toBeDefined();
        });
    });
});
