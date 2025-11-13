import { TypeGenerator } from '../../src/cli/type-generator';

describe('TypeGenerator', () => {
    describe('schemaToType', () => {
        it('should return "any" for undefined schema', () => {
            expect(TypeGenerator.schemaToType(undefined)).toBe('any');
        });

        it('should handle string type', () => {
            expect(TypeGenerator.schemaToType({ type: 'string' })).toBe(
                'string',
            );
        });

        it('should handle string enum', () => {
            const schema = {
                type: 'string',
                enum: ['option1', 'option2', 'option3'],
            };
            expect(TypeGenerator.schemaToType(schema)).toBe(
                "'option1' | 'option2' | 'option3'",
            );
        });

        it('should handle number type', () => {
            expect(TypeGenerator.schemaToType({ type: 'number' })).toBe(
                'number',
            );
        });

        it('should handle integer type', () => {
            expect(TypeGenerator.schemaToType({ type: 'integer' })).toBe(
                'number',
            );
        });

        it('should handle boolean type', () => {
            expect(TypeGenerator.schemaToType({ type: 'boolean' })).toBe(
                'boolean',
            );
        });

        it('should handle array type with items', () => {
            const schema = {
                type: 'array',
                items: { type: 'string' },
            };
            expect(TypeGenerator.schemaToType(schema)).toBe('string[]');
        });

        it('should handle array type without items', () => {
            expect(TypeGenerator.schemaToType({ type: 'array' })).toBe('any[]');
        });

        it('should handle nested array types', () => {
            const schema = {
                type: 'array',
                items: {
                    type: 'array',
                    items: { type: 'number' },
                },
            };
            expect(TypeGenerator.schemaToType(schema)).toBe('number[][]');
        });

        it('should handle object type with properties', () => {
            const schema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' },
                },
                required: ['name'],
            };
            const result = TypeGenerator.schemaToType(schema);
            expect(result).toContain('name: string;');
            expect(result).toContain('age?: number;');
        });

        it('should handle object type without properties', () => {
            expect(TypeGenerator.schemaToType({ type: 'object' })).toBe(
                'Record<string, any>',
            );
        });

        it('should handle oneOf schemas', () => {
            const schema = {
                oneOf: [{ type: 'string' }, { type: 'number' }],
            };
            expect(TypeGenerator.schemaToType(schema)).toBe('string | number');
        });

        it('should handle anyOf schemas', () => {
            const schema = {
                anyOf: [{ type: 'boolean' }, { type: 'string' }],
            };
            expect(TypeGenerator.schemaToType(schema)).toBe('boolean | string');
        });

        it('should handle complex nested schemas', () => {
            const schema = {
                type: 'object',
                properties: {
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                        },
                        required: ['id'],
                    },
                },
                required: [],
            };
            const result = TypeGenerator.schemaToType(schema);
            expect(result).toContain('user?:');
            expect(result).toContain('id: number');
            expect(result).toContain('name?: string');
        });

        it('should handle unknown schema types as any', () => {
            expect(TypeGenerator.schemaToType({ type: 'unknown' })).toBe('any');
            expect(TypeGenerator.schemaToType({})).toBe('any');
        });
    });

    describe('generateInterface', () => {
        it('should generate type alias for non-object schemas', () => {
            const result = TypeGenerator.generateInterface('MyString', {
                type: 'string',
            });
            expect(result).toBe('export type MyString = string;');
        });

        it('should generate type alias for undefined schema', () => {
            const result = TypeGenerator.generateInterface('MyAny', undefined);
            expect(result).toBe('export type MyAny = any;');
        });

        it('should generate interface for object schemas', () => {
            const schema = {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                },
                required: ['id'],
            };
            const result = TypeGenerator.generateInterface('User', schema);

            expect(result).toContain('export interface User {');
            expect(result).toContain('id: number;');
            expect(result).toContain('name?: string;');
        });

        it('should include property descriptions as comments', () => {
            const schema = {
                type: 'object',
                properties: {
                    id: {
                        type: 'number',
                        description: 'Unique identifier',
                    },
                    name: {
                        type: 'string',
                        description: 'User full name',
                    },
                },
                required: [],
            };
            const result = TypeGenerator.generateInterface('User', schema);

            expect(result).toContain('/** Unique identifier */');
            expect(result).toContain('/** User full name */');
        });

        it('should handle empty object schema', () => {
            const schema = {
                type: 'object',
                properties: {},
            };
            const result = TypeGenerator.generateInterface('Empty', schema);

            expect(result).toContain('export interface Empty {');
            expect(result).toMatch(/\{\s*\}/);
        });

        it('should handle complex nested interfaces', () => {
            const schema = {
                type: 'object',
                properties: {
                    metadata: {
                        type: 'object',
                        properties: {
                            created: { type: 'string' },
                            updated: { type: 'string' },
                        },
                        required: ['created'],
                    },
                    tags: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['metadata'],
            };
            const result = TypeGenerator.generateInterface('Document', schema);

            expect(result).toContain('metadata: {');
            expect(result).toContain('created: string');
            expect(result).toContain('updated?: string');
            expect(result).toContain('tags?: string[]');
        });

        it('should handle schema with all properties required', () => {
            const schema = {
                type: 'object',
                properties: {
                    field1: { type: 'string' },
                    field2: { type: 'number' },
                    field3: { type: 'boolean' },
                },
                required: ['field1', 'field2', 'field3'],
            };
            const result = TypeGenerator.generateInterface('Required', schema);

            expect(result).toContain('field1: string;');
            expect(result).toContain('field2: number;');
            expect(result).toContain('field3: boolean;');
            expect(result).not.toContain('?:');
        });
    });

    describe('toTypeName', () => {
        it('should convert snake_case to PascalCase', () => {
            expect(TypeGenerator.toTypeName('my_type_name')).toBe('MyTypeName');
        });

        it('should convert kebab-case to PascalCase', () => {
            expect(TypeGenerator.toTypeName('my-type-name')).toBe('MyTypeName');
        });

        it('should convert space separated to PascalCase', () => {
            expect(TypeGenerator.toTypeName('my type name')).toBe('MyTypeName');
        });

        it('should handle mixed separators', () => {
            expect(TypeGenerator.toTypeName('my_type-name test')).toBe(
                'MyTypeNameTest',
            );
        });

        it('should handle already PascalCase names', () => {
            expect(TypeGenerator.toTypeName('MyTypeName')).toBe('MyTypeName');
        });

        it('should handle single word', () => {
            expect(TypeGenerator.toTypeName('user')).toBe('User');
        });

        it('should handle names with numbers', () => {
            expect(TypeGenerator.toTypeName('user_123_test')).toBe(
                'User123Test',
            );
        });

        it('should remove special characters', () => {
            expect(TypeGenerator.toTypeName('my@type#name!')).toBe(
                'MyTypeName',
            );
        });

        it('should handle empty string', () => {
            expect(TypeGenerator.toTypeName('')).toBe('');
        });

        it('should handle names with multiple consecutive separators', () => {
            expect(TypeGenerator.toTypeName('my___type---name')).toBe(
                'MyTypeName',
            );
        });

        it('should handle leading and trailing separators', () => {
            expect(TypeGenerator.toTypeName('_my_type_')).toBe('MyType');
            expect(TypeGenerator.toTypeName('-my-type-')).toBe('MyType');
        });
    });

    describe('integration scenarios', () => {
        it('should generate complete type for tool parameters', () => {
            const schema = {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Search query',
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum results',
                    },
                    filters: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
                required: ['query'],
            };

            const typeName = TypeGenerator.toTypeName('search_documents');
            const result = TypeGenerator.generateInterface(typeName, schema);

            expect(typeName).toBe('SearchDocuments');
            expect(result).toContain('export interface SearchDocuments');
            expect(result).toContain('/** Search query */');
            expect(result).toContain('query: string');
            expect(result).toContain('limit?: number');
            expect(result).toContain('filters?: string[]');
        });

        it('should handle enum types in interfaces', () => {
            const schema = {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        enum: ['active', 'inactive', 'pending'],
                        description: 'Current status',
                    },
                },
                required: ['status'],
            };

            const result = TypeGenerator.generateInterface('Status', schema);

            expect(result).toContain("'active' | 'inactive' | 'pending'");
            expect(result).toContain('/** Current status */');
        });
    });
});
