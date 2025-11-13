import { Test, TestingModule } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { MCPModule } from '../../src/modules/mcp.module';
import { MCPService } from '../../src/services/mcp.service';
import { MCPTool, MCPResourceTemplate, MCPPrompt } from '../../src/decorators';
import { MCPRequest, MCPPromptMessage } from '../../src/interfaces';
import { MCPMethod } from '../../src/constants';

// Test provider with Zod-validated tools
@Injectable()
class TestZodToolsProvider {
    @MCPTool({
        name: 'calculate',
        description: 'Perform calculations',
        schema: z.object({
            operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
            a: z.number().describe('First operand'),
            b: z.number().describe('Second operand'),
        }),
    })
    async calculate(params: { operation: string; a: number; b: number }) {
        const { operation, a, b } = params;
        switch (operation) {
            case 'add':
                return a + b;
            case 'subtract':
                return a - b;
            case 'multiply':
                return a * b;
            case 'divide':
                return a / b;
            default:
                throw new Error('Invalid operation');
        }
    }

    @MCPTool({
        name: 'createUser',
        description: 'Create a new user',
        schema: z.object({
            name: z.string().min(1).describe('User name'),
            email: z.string().email().describe('User email'),
            age: z.number().min(18).max(120).optional().describe('User age'),
            active: z.boolean().default(true).describe('Is user active'),
        }),
    })
    async createUser(params: {
        name: string;
        email: string;
        age?: number;
        active?: boolean;
    }) {
        return {
            id: '123',
            ...params,
            active: params.active ?? true,
        };
    }
}

// Test provider with Zod-validated resources
@Injectable()
class TestZodResourcesProvider {
    @MCPResourceTemplate({
        uriTemplate: 'user://{id}',
        name: 'user-resource',
        description: 'Get user by ID',
        mimeType: 'application/json',
        schema: z.object({
            id: z.string().uuid().describe('User UUID'),
        }),
    })
    async getUser(variables: { id: string }) {
        return {
            uri: `user://${variables.id}`,
            mimeType: 'application/json',
            text: JSON.stringify({
                id: variables.id,
                name: 'John Doe',
                email: 'john@example.com',
            }),
        };
    }
}

// Test provider with Zod-validated prompts
@Injectable()
class TestZodPromptsProvider {
    @MCPPrompt({
        name: 'codeReview',
        description: 'Generate a code review prompt',
        schema: z.object({
            language: z
                .enum(['typescript', 'javascript', 'python', 'java'])
                .describe('Programming language'),
            code: z.string().min(1).describe('Code to review'),
            focus: z
                .enum(['performance', 'security', 'style', 'all'])
                .optional()
                .describe('Review focus area'),
        }),
    })
    async codeReview(params: {
        language: string;
        code: string;
        focus?: string;
    }): Promise<MCPPromptMessage[]> {
        return [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `Please review this ${params.language} code${params.focus ? ` focusing on ${params.focus}` : ''}:\n\n${params.code}`,
                },
            },
        ];
    }
}

describe('Zod Integration', () => {
    let service: MCPService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MCPModule.forRoot({
                    serverInfo: {
                        name: 'Test Zod Server',
                        version: '1.0.0',
                    },
                    enableLogging: false,
                }),
            ],
            providers: [
                TestZodToolsProvider,
                TestZodResourcesProvider,
                TestZodPromptsProvider,
            ],
        }).compile();

        service = module.get<MCPService>(MCPService);
        await module.init();
    });

    describe('Tool Validation', () => {
        it('should validate tool arguments with Zod schema', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.TOOLS_CALL,
                params: {
                    name: 'calculate',
                    arguments: {
                        operation: 'add',
                        a: 5,
                        b: 3,
                    },
                },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeUndefined();
            expect(response.result).toBeDefined();
        });

        it('should reject invalid enum value', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.TOOLS_CALL,
                params: {
                    name: 'calculate',
                    arguments: {
                        operation: 'invalid',
                        a: 5,
                        b: 3,
                    },
                },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.message).toContain('Invalid tool arguments');
        });

        it('should reject invalid number type', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.TOOLS_CALL,
                params: {
                    name: 'calculate',
                    arguments: {
                        operation: 'add',
                        a: 'not-a-number',
                        b: 3,
                    },
                },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.message).toContain('Invalid tool arguments');
        });

        it('should validate email format', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.TOOLS_CALL,
                params: {
                    name: 'createUser',
                    arguments: {
                        name: 'John',
                        email: 'invalid-email',
                    },
                },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.message).toContain('Invalid tool arguments');
        });

        it('should accept valid email and apply defaults', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.TOOLS_CALL,
                params: {
                    name: 'createUser',
                    arguments: {
                        name: 'John',
                        email: 'john@example.com',
                    },
                },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeUndefined();
            expect(response.result).toBeDefined();
        });

        it('should validate min/max constraints', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.TOOLS_CALL,
                params: {
                    name: 'createUser',
                    arguments: {
                        name: 'John',
                        email: 'john@example.com',
                        age: 15, // Below minimum of 18
                    },
                },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.message).toContain('Invalid tool arguments');
        });
    });

    describe('Resource Validation', () => {
        it('should validate UUID format in resource template', async () => {
            const validUuid = '550e8400-e29b-41d4-a716-446655440000';
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.RESOURCES_READ,
                params: {
                    uri: `user://${validUuid}`,
                },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeUndefined();
            expect(response.result).toBeDefined();
        });

        it('should reject invalid UUID format', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.RESOURCES_READ,
                params: {
                    uri: 'user://invalid-uuid',
                },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.message).toContain(
                'Invalid resource variables',
            );
        });
    });

    describe('Prompt Validation', () => {
        it('should validate prompt arguments with Zod schema', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.PROMPTS_GET,
                params: {
                    name: 'codeReview',
                    arguments: {
                        language: 'typescript',
                        code: 'const x = 1;',
                    },
                },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeUndefined();
            expect(response.result).toBeDefined();
        });

        it('should reject invalid language enum', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.PROMPTS_GET,
                params: {
                    name: 'codeReview',
                    arguments: {
                        language: 'ruby',
                        code: 'const x = 1;',
                    },
                },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeDefined();
            expect(response.error?.message).toContain(
                'Invalid prompt arguments',
            );
        });

        it('should accept optional focus parameter', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.PROMPTS_GET,
                params: {
                    name: 'codeReview',
                    arguments: {
                        language: 'typescript',
                        code: 'const x = 1;',
                        focus: 'performance',
                    },
                },
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeUndefined();
            expect(response.result).toBeDefined();
        });
    });

    describe('JSON Schema Generation', () => {
        it('should generate JSON Schema from Zod schema in tools/list', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.TOOLS_LIST,
            };

            const response = await service.handleRequest(request);

            expect(response.error).toBeUndefined();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tools = (response.result as any).tools;
            const calculateTool = tools.find(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (t: any) => t.name === 'calculate',
            );

            expect(calculateTool).toBeDefined();
            expect(calculateTool.inputSchema).toBeDefined();
            expect(calculateTool.inputSchema.type).toBe('object');
            expect(calculateTool.inputSchema.properties).toBeDefined();
            expect(calculateTool.inputSchema.properties.operation).toEqual({
                type: 'string',
                enum: ['add', 'subtract', 'multiply', 'divide'],
            });
            expect(calculateTool.inputSchema.properties.a).toMatchObject({
                type: 'number',
                description: 'First operand',
            });
        });
    });
});
