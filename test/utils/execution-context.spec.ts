import {
    MCPContextImpl,
    MCPExecutionContextImpl,
} from '../../src/utils/execution-context';
import { MCPRequest, MCPContextType } from '../../src/interfaces';

describe('MCPContextImpl', () => {
    let context: MCPContextImpl;
    let mockRequest: MCPRequest;

    beforeEach(() => {
        mockRequest = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: { name: 'test-tool', arguments: {} },
        };

        context = new MCPContextImpl(mockRequest, 'test-operation', 'tool');
    });

    describe('getRequest', () => {
        it('should return the request object', () => {
            expect(context.getRequest()).toBe(mockRequest);
        });
    });

    describe('getOperationName', () => {
        it('should return the operation name', () => {
            expect(context.getOperationName()).toBe('test-operation');
        });
    });

    describe('getType', () => {
        it('should return the context type', () => {
            expect(context.getType()).toBe('tool');
        });

        it('should handle different context types', () => {
            const resourceContext = new MCPContextImpl(
                mockRequest,
                'resource-op',
                'resource',
            );
            expect(resourceContext.getType()).toBe('resource');

            const promptContext = new MCPContextImpl(
                mockRequest,
                'prompt-op',
                'prompt',
            );
            expect(promptContext.getType()).toBe('prompt');
        });
    });

    describe('getData and setData', () => {
        it('should store and retrieve custom data', () => {
            context.setData('user', { id: 123, name: 'John' });
            const userData = context.getData<{ id: number; name: string }>(
                'user',
            );

            expect(userData).toEqual({ id: 123, name: 'John' });
        });

        it('should return undefined for non-existent keys', () => {
            expect(context.getData('nonexistent')).toBeUndefined();
        });

        it('should handle multiple data entries', () => {
            context.setData('key1', 'value1');
            context.setData('key2', 42);
            context.setData('key3', { nested: true });

            expect(context.getData('key1')).toBe('value1');
            expect(context.getData<number>('key2')).toBe(42);
            expect(context.getData<{ nested: boolean }>('key3')).toEqual({
                nested: true,
            });
        });

        it('should overwrite existing data', () => {
            context.setData('key', 'first');
            context.setData('key', 'second');

            expect(context.getData('key')).toBe('second');
        });

        it('should handle null and undefined values', () => {
            context.setData('nullKey', null);
            context.setData('undefinedKey', undefined);

            expect(context.getData('nullKey')).toBeNull();
            expect(context.getData('undefinedKey')).toBeUndefined();
        });

        it('should handle complex data types', () => {
            const complexData = {
                array: [1, 2, 3],
                nested: { deep: { value: 'test' } },
                func: () => 'hello',
            };

            context.setData('complex', complexData);
            const retrieved = context.getData<typeof complexData>('complex');

            expect(retrieved).toBe(complexData);
            expect(retrieved?.array).toEqual([1, 2, 3]);
            expect(retrieved?.nested.deep.value).toBe('test');
        });
    });
});

describe('MCPExecutionContextImpl', () => {
    let executionContext: MCPExecutionContextImpl;
    let mockRequest: MCPRequest;
    let mockClassRef: new () => unknown;
    let mockMetadata: Record<string, unknown>;

    beforeEach(() => {
        mockRequest = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: { name: 'test-tool', arguments: { input: 'test' } },
        };

        mockClassRef = class TestProvider {};
        mockMetadata = {
            role: 'admin',
            permission: 'read',
        };

        executionContext = new MCPExecutionContextImpl(
            'tool' as MCPContextType,
            mockRequest,
            mockClassRef,
            'testMethod',
            [{ arg1: 'value1' }, 42],
            mockMetadata,
            'test-operation',
        );
    });

    describe('getType', () => {
        it('should return the context type', () => {
            expect(executionContext.getType()).toBe('tool');
        });
    });

    describe('getRequest', () => {
        it('should return the request object', () => {
            expect(executionContext.getRequest()).toBe(mockRequest);
        });
    });

    describe('getClass', () => {
        it('should return the class reference', () => {
            expect(executionContext.getClass()).toBe(mockClassRef);
        });
    });

    describe('getHandler', () => {
        it('should return the handler name', () => {
            expect(executionContext.getHandler()).toBe('testMethod');
        });
    });

    describe('getArgs', () => {
        it('should return the arguments array', () => {
            const args = executionContext.getArgs();
            expect(args).toEqual([{ arg1: 'value1' }, 42]);
        });

        it('should handle empty arguments', () => {
            const emptyContext = new MCPExecutionContextImpl(
                'tool' as MCPContextType,
                mockRequest,
                mockClassRef,
                'emptyMethod',
                [],
                mockMetadata,
                'empty-op',
            );

            expect(emptyContext.getArgs()).toEqual([]);
        });
    });

    describe('getMetadata', () => {
        it('should return metadata value for existing key', () => {
            expect(executionContext.getMetadata<string>('role')).toBe('admin');
            expect(executionContext.getMetadata<string>('permission')).toBe(
                'read',
            );
        });

        it('should return undefined for non-existent key', () => {
            expect(executionContext.getMetadata('nonexistent')).toBeUndefined();
        });

        it('should handle typed metadata retrieval', () => {
            const contextWithTypes = new MCPExecutionContextImpl(
                'tool' as MCPContextType,
                mockRequest,
                mockClassRef,
                'handler',
                [],
                {
                    count: 42,
                    enabled: true,
                    items: ['a', 'b', 'c'],
                },
                'typed-op',
            );

            expect(contextWithTypes.getMetadata<number>('count')).toBe(42);
            expect(contextWithTypes.getMetadata<boolean>('enabled')).toBe(true);
            expect(contextWithTypes.getMetadata<string[]>('items')).toEqual([
                'a',
                'b',
                'c',
            ]);
        });
    });

    describe('getAllMetadata', () => {
        it('should return a copy of all metadata', () => {
            const allMetadata = executionContext.getAllMetadata();
            expect(allMetadata).toEqual({
                role: 'admin',
                permission: 'read',
            });
        });

        it('should return a new object (not reference)', () => {
            const allMetadata = executionContext.getAllMetadata();
            allMetadata.newKey = 'newValue';

            // Original metadata should not be affected
            expect(executionContext.getMetadata('newKey')).toBeUndefined();
            expect(executionContext.getAllMetadata()).not.toHaveProperty(
                'newKey',
            );
        });

        it('should handle empty metadata', () => {
            const emptyContext = new MCPExecutionContextImpl(
                'tool' as MCPContextType,
                mockRequest,
                mockClassRef,
                'handler',
                [],
                {},
                'empty-meta',
            );

            expect(emptyContext.getAllMetadata()).toEqual({});
        });
    });

    describe('switchToMcp', () => {
        it('should return MCPContext instance', () => {
            const mcpContext = executionContext.switchToMcp();

            expect(mcpContext).toBeDefined();
            expect(mcpContext.getRequest()).toBe(mockRequest);
            expect(mcpContext.getOperationName()).toBe('test-operation');
            expect(mcpContext.getType()).toBe('tool');
        });

        it('should return the same MCPContext instance on multiple calls', () => {
            const mcpContext1 = executionContext.switchToMcp();
            const mcpContext2 = executionContext.switchToMcp();

            expect(mcpContext1).toBe(mcpContext2);
        });

        it('should allow data storage through switched context', () => {
            const mcpContext = executionContext.switchToMcp();

            mcpContext.setData('customKey', 'customValue');

            expect(mcpContext.getData('customKey')).toBe('customValue');
        });
    });

    describe('different context types', () => {
        it('should handle resource context', () => {
            const resourceContext = new MCPExecutionContextImpl(
                'resource' as MCPContextType,
                mockRequest,
                mockClassRef,
                'readResource',
                [],
                {},
                'resource-read',
            );

            expect(resourceContext.getType()).toBe('resource');
            expect(resourceContext.switchToMcp().getType()).toBe('resource');
        });

        it('should handle prompt context', () => {
            const promptContext = new MCPExecutionContextImpl(
                'prompt' as MCPContextType,
                mockRequest,
                mockClassRef,
                'getPrompt',
                [],
                {},
                'prompt-get',
            );

            expect(promptContext.getType()).toBe('prompt');
            expect(promptContext.switchToMcp().getType()).toBe('prompt');
        });
    });

    describe('integration with MCPContext', () => {
        it('should properly pass data to inner MCPContext', () => {
            const mcpContext = executionContext.switchToMcp();

            expect(mcpContext.getRequest()).toBe(mockRequest);
            expect(mcpContext.getOperationName()).toBe('test-operation');
            expect(mcpContext.getType()).toBe('tool');
        });

        it('should maintain separate custom data in MCPContext', () => {
            const mcpContext = executionContext.switchToMcp();

            mcpContext.setData('key1', 'value1');
            mcpContext.setData('key2', { nested: true });

            expect(mcpContext.getData('key1')).toBe('value1');
            expect(mcpContext.getData<{ nested: boolean }>('key2')).toEqual({
                nested: true,
            });
        });
    });
});
