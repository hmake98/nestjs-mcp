import 'reflect-metadata';
import { SetMetadata } from '@nestjs/common';
import {
    MCPTool,
    MCPToolWithParams,
    MCPToolParams,
} from '../../src/decorators/mcp-tool.decorator';
import {
    MCPResource,
    MCPResourceTemplate,
} from '../../src/decorators/mcp-resource.decorator';
import { MCPPrompt } from '../../src/decorators/mcp-prompt.decorator';
import {
    MCP_TOOL_METADATA,
    MCP_RESOURCE_METADATA,
    MCP_PROMPT_METADATA,
    MCP_TOOL_PARAM_METADATA,
} from '../../src/constants';

// Mock SetMetadata
jest.mock('@nestjs/common', () => ({
    ...jest.requireActual('@nestjs/common'),
    SetMetadata: jest.fn(
        (key, value) => (target: object, propertyKey: unknown) => {
            Reflect.defineMetadata(
                key,
                value,
                target,
                propertyKey as string | symbol,
            );
            return {} as PropertyDescriptor;
        },
    ),
}));

describe('Decorators', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('@MCPTool', () => {
        it('should set tool metadata', () => {
            class TestClass {
                @MCPTool({ name: 'test-tool', description: 'Test tool' })
                testMethod() {
                    return 'test';
                }
            }

            const instance = new TestClass();
            const metadata = Reflect.getMetadata(
                MCP_TOOL_METADATA,
                instance,
                'testMethod',
            );

            expect(metadata).toEqual({
                name: 'test-tool',
                description: 'Test tool',
            });
        });

        it('should call SetMetadata with correct parameters', () => {
            const metadata = { name: 'test-tool', description: 'Test tool' };

            class _TestClass {
                @MCPTool(metadata)
                testMethod() {
                    return 'test';
                }
            }

            expect(SetMetadata).toHaveBeenCalledWith(
                MCP_TOOL_METADATA,
                metadata,
            );
        });
    });

    describe('@MCPToolParams', () => {
        it('should set tool parameter metadata', () => {
            const parameters = [
                { type: 'string' as const, description: 'Param 1' },
                { type: 'number' as const, description: 'Param 2' },
            ];

            class TestClass {
                @MCPToolParams(parameters)
                testMethod() {
                    return 'test';
                }
            }

            const instance = new TestClass();
            const metadata = Reflect.getMetadata(
                MCP_TOOL_PARAM_METADATA,
                instance,
                'testMethod',
            );

            expect(metadata).toEqual(parameters);
        });
    });

    describe('@MCPToolWithParams', () => {
        it('should set both tool and parameter metadata', () => {
            const metadata = {
                name: 'test-tool',
                description: 'Test tool',
                parameters: [
                    {
                        type: 'string' as const,
                        description: 'Param 1',
                        required: true,
                    },
                ],
            };

            class TestClass {
                @MCPToolWithParams(metadata)
                testMethod() {
                    return 'test';
                }
            }

            const instance = new TestClass();
            const toolMetadata = Reflect.getMetadata(
                MCP_TOOL_METADATA,
                instance,
                'testMethod',
            );
            const paramMetadata = Reflect.getMetadata(
                MCP_TOOL_PARAM_METADATA,
                instance,
                'testMethod',
            );

            expect(toolMetadata).toEqual({
                name: 'test-tool',
                description: 'Test tool',
            });
            expect(paramMetadata).toEqual(metadata.parameters);
        });
    });

    describe('@MCPResource', () => {
        it('should set resource metadata', () => {
            class TestClass {
                @MCPResource({
                    uri: 'file:///test.txt',
                    name: 'Test Resource',
                    description: 'A test resource',
                })
                testMethod() {
                    return { uri: 'file:///test.txt', text: 'content' };
                }
            }

            const instance = new TestClass();
            const metadata = Reflect.getMetadata(
                MCP_RESOURCE_METADATA,
                instance,
                'testMethod',
            );

            expect(metadata).toEqual({
                uri: 'file:///test.txt',
                name: 'Test Resource',
                description: 'A test resource',
            });
        });

        it('should call SetMetadata with correct parameters', () => {
            const metadata = {
                uri: 'file:///test.txt',
                name: 'Test Resource',
            };

            class _TestClass {
                @MCPResource(metadata)
                testMethod() {
                    return { uri: 'file:///test.txt', text: 'content' };
                }
            }

            expect(SetMetadata).toHaveBeenCalledWith(
                MCP_RESOURCE_METADATA,
                metadata,
            );
        });
    });

    describe('@MCPResourceTemplate', () => {
        it('should set resource template metadata', () => {
            class _TestClass {
                @MCPResourceTemplate({
                    uriTemplate: 'file:///{filename}',
                    name: 'Dynamic Resource',
                    description: 'A dynamic resource',
                })
                testMethod() {
                    return { uri: 'file:///test.txt', text: 'content' };
                }
            }

            const instance = new _TestClass();
            const metadata = Reflect.getMetadata(
                MCP_RESOURCE_METADATA,
                instance,
                'testMethod',
            );

            expect(metadata).toEqual({
                uriTemplate: 'file:///{filename}',
                name: 'Dynamic Resource',
                description: 'A dynamic resource',
                isTemplate: true,
            });
        });
    });

    describe('@MCPPrompt', () => {
        it('should set prompt metadata', () => {
            class TestClass {
                @MCPPrompt({
                    name: 'test-prompt',
                    description: 'Test prompt',
                    arguments: [{ name: 'arg1', description: 'Argument 1' }],
                })
                testMethod() {
                    return [
                        {
                            role: 'user',
                            content: { type: 'text', text: 'test' },
                        },
                    ];
                }
            }

            const instance = new TestClass();
            const metadata = Reflect.getMetadata(
                MCP_PROMPT_METADATA,
                instance,
                'testMethod',
            );

            expect(metadata).toEqual({
                name: 'test-prompt',
                description: 'Test prompt',
                arguments: [{ name: 'arg1', description: 'Argument 1' }],
            });
        });

        it('should call SetMetadata with correct parameters', () => {
            const metadata = {
                name: 'test-prompt',
                description: 'Test prompt',
            };

            class _TestClass {
                @MCPPrompt(metadata)
                testMethod() {
                    return [
                        {
                            role: 'user',
                            content: { type: 'text', text: 'test' },
                        },
                    ];
                }
            }

            expect(SetMetadata).toHaveBeenCalledWith(
                MCP_PROMPT_METADATA,
                metadata,
            );
        });
    });
});
