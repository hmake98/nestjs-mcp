import { z } from 'zod';
import {
    zodToJsonSchema,
    zodSchemaToMCPParameters,
    validateWithZod,
    safeValidateWithZod,
} from '../../src/utils/zod-helpers';

describe('Zod Helpers', () => {
    describe('toJSONValue helper', () => {
        it('should handle null values in default', () => {
            const schema = z.object({
                nullable: z.string().nullable().default(null),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0].default).toBeNull();
        });

        it('should handle undefined as no default', () => {
            const schema = z.object({
                optional: z.string().optional(),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0]).not.toHaveProperty('default');
        });

        it('should handle undefined default value', () => {
            // Test when default value is undefined (non-JSON primitive)
            const schema = z.object({
                field: z.string().default(() => undefined as unknown as string),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            // When toJSONValue receives undefined, it returns null (line 45)
            // But the parameter should not have a default property when it's undefined
            expect(parameters[0].name).toBe('field');
        });

        it('should handle function default value that returns undefined', () => {
            // Test default function that returns undefined
            const schema = z.object({
                optField: z.any().default(() => undefined),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters).toHaveLength(1);
            expect(parameters[0].name).toBe('optField');
        });

        it('should handle BigInt in default value (non-JSON type)', () => {
            // BigInt is not a JSON type, should trigger line 45 return null
            const schema = z.object({
                field: z.any().default(() => BigInt(123)),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters).toHaveLength(1);
            // The default value will be processed through toJSONValue
            // which returns null for non-JSON types
        });

        it('should handle Symbol in default value (non-JSON type)', () => {
            // Symbol is not a JSON type, should trigger line 45 return null
            const schema = z.object({
                field: z.any().default(() => Symbol('test')),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters).toHaveLength(1);
        });
    });

    describe('zodToJsonSchema', () => {
        it('should convert ZodString to JSON Schema', () => {
            const schema = z.string().describe('A string field');
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'string',
                description: 'A string field',
            });
        });

        it('should convert ZodString without checks to JSON Schema', () => {
            const schema = z.string().describe('A string without checks');
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'string',
                description: 'A string without checks',
            });
            // Verify no minLength or maxLength properties
            expect(jsonSchema).not.toHaveProperty('minLength');
            expect(jsonSchema).not.toHaveProperty('maxLength');
        });

        it('should convert ZodNumber to JSON Schema', () => {
            const schema = z.number().min(0).max(100).describe('A number');
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'number',
                description: 'A number',
                minimum: 0,
                maximum: 100,
            });
        });

        it('should convert ZodNumber without checks to JSON Schema', () => {
            const schema = z.number().describe('A number without checks');
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'number',
                description: 'A number without checks',
            });
            // Verify no minimum or maximum properties
            expect(jsonSchema).not.toHaveProperty('minimum');
            expect(jsonSchema).not.toHaveProperty('maximum');
        });

        it('should convert ZodBoolean to JSON Schema', () => {
            const schema = z.boolean().describe('A boolean');
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'boolean',
                description: 'A boolean',
            });
        });

        it('should convert ZodArray to JSON Schema', () => {
            const schema = z.array(z.string()).describe('An array of strings');
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'array',
                description: 'An array of strings',
                items: {
                    type: 'string',
                },
            });
        });

        it('should convert ZodObject to JSON Schema', () => {
            const schema = z
                .object({
                    name: z.string().describe('User name'),
                    age: z.number().describe('User age'),
                    active: z.boolean().optional(),
                })
                .describe('A user object');

            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'object',
                description: 'A user object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'User name',
                    },
                    age: {
                        type: 'number',
                        description: 'User age',
                    },
                    active: {
                        type: 'boolean',
                    },
                },
                required: ['name', 'age'],
            });
        });

        it('should convert ZodEnum to JSON Schema', () => {
            const schema = z.enum(['red', 'green', 'blue']).describe('A color');
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'string',
                description: 'A color',
                enum: ['red', 'green', 'blue'],
            });
        });

        it('should handle ZodDefault', () => {
            const schema = z.string().default('default value');
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'string',
                default: 'default value',
            });
        });

        it('should handle ZodNullable', () => {
            const schema = z.string().nullable();
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'string',
                nullable: true,
            });
        });

        it('should handle ZodLiteral', () => {
            const schema = z.literal('exact-value');
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'string',
                const: 'exact-value',
            });
        });

        it('should handle ZodLiteral with description', () => {
            const schema = z.literal(42).describe('Magic number');
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'number',
                const: 42,
                description: 'Magic number',
            });
        });

        it('should handle ZodUnion', () => {
            const schema = z.union([z.string(), z.number()]);
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toHaveProperty('oneOf');
            expect(jsonSchema.oneOf).toHaveLength(2);
            expect(jsonSchema.oneOf).toEqual([
                { type: 'string' },
                { type: 'number' },
            ]);
        });

        it('should handle ZodOptional by unwrapping', () => {
            const schema = z.string().optional();
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'string',
            });
        });

        it('should handle string with min/max length', () => {
            const schema = z.string().min(3).max(10);
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'string',
                minLength: 3,
                maxLength: 10,
            });
        });

        it('should handle array with min/max items', () => {
            const schema = z.array(z.string()).min(1).max(5);
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                maxItems: 5,
            });
        });

        it('should fallback to object type for unknown schemas', () => {
            // Create a custom schema type that's not handled
            const schema = z.any();
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'object',
            });
        });

        it('should handle object with nullable fields', () => {
            const schema = z.object({
                name: z.string(),
                middleName: z.string().nullable(),
            });

            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema.properties).toHaveProperty('name');
            expect(jsonSchema.properties).toHaveProperty('middleName');
            expect(jsonSchema.required).toEqual(['name', 'middleName']);
        });

        it('should handle object with only optional fields', () => {
            const schema = z.object({
                nickname: z.string().optional(),
                alias: z.string().optional(),
            });

            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema.required).toEqual([]);
            expect(Object.keys(jsonSchema.properties || {})).toEqual([
                'nickname',
                'alias',
            ]);
        });
    });

    describe('zodSchemaToMCPParameters', () => {
        it('should convert Zod object schema to MCP parameters', () => {
            const schema = z.object({
                name: z.string().describe('User name'),
                age: z.number().describe('User age'),
                email: z.string().optional().describe('User email'),
                active: z.boolean().default(true).describe('Is active'),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters).toHaveLength(4);
            expect(parameters[0]).toEqual({
                name: 'name',
                type: 'string',
                description: 'User name',
                required: true,
            });
            expect(parameters[1]).toEqual({
                name: 'age',
                type: 'number',
                description: 'User age',
                required: true,
            });
            expect(parameters[2]).toEqual({
                name: 'email',
                type: 'string',
                description: 'User email',
                required: false,
            });
            expect(parameters[3]).toEqual({
                name: 'active',
                type: 'boolean',
                description: 'Is active',
                required: false,
                default: true,
            });
        });

        it('should handle enum types', () => {
            const schema = z.object({
                status: z.enum(['pending', 'active', 'completed']),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0]).toMatchObject({
                name: 'status',
                type: 'string',
                enum: ['pending', 'active', 'completed'],
                required: true,
            });
        });

        it('should handle array types', () => {
            const schema = z.object({
                tags: z.array(z.string()).describe('User tags'),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0]).toEqual({
                name: 'tags',
                type: 'array',
                description: 'User tags',
                required: true,
            });
        });

        it('should handle object types', () => {
            const schema = z.object({
                metadata: z.object({
                    key: z.string(),
                }),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0]).toMatchObject({
                name: 'metadata',
                type: 'object',
                required: true,
            });
        });

        it('should handle nullable fields', () => {
            const schema = z.object({
                middleName: z.string().nullable().describe('Middle name'),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0]).toEqual({
                name: 'middleName',
                type: 'string',
                description: 'Middle name',
                required: true,
            });
        });

        it('should handle optional with description preserved', () => {
            const schema = z.object({
                nickname: z.string().describe('User nickname').optional(),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0]).toEqual({
                name: 'nickname',
                type: 'string',
                description: 'User nickname',
                required: false,
            });
        });

        it('should handle default with inner description', () => {
            const schema = z.object({
                role: z.string().describe('User role').default('user'),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0]).toEqual({
                name: 'role',
                type: 'string',
                description: 'User role',
                required: false,
                default: 'user',
            });
        });

        it('should handle nullable with inner description', () => {
            const schema = z.object({
                suffix: z.string().describe('Name suffix').nullable(),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0]).toEqual({
                name: 'suffix',
                type: 'string',
                description: 'Name suffix',
                required: true,
            });
        });

        it('should handle complex default values', () => {
            const schema = z.object({
                config: z.object({ key: z.string() }).default({ key: 'value' }),
                items: z.array(z.string()).default(['item1']),
                count: z.number().default(0),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0].default).toEqual({ key: 'value' });
            expect(parameters[1].default).toEqual(['item1']);
            expect(parameters[2].default).toBe(0);
        });

        it('should handle enum with default values in enum array', () => {
            const schema = z.object({
                priority: z.enum(['low', 'medium', 'high']).default('medium'),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0]).toMatchObject({
                name: 'priority',
                type: 'string',
                enum: ['low', 'medium', 'high'],
                required: false,
                default: 'medium',
            });
        });
    });

    describe('validateWithZod', () => {
        it('should validate valid data', () => {
            const schema = z.object({
                name: z.string(),
                age: z.number(),
            });

            const data = { name: 'John', age: 30 };
            const result = validateWithZod(schema, data);

            expect(result).toEqual(data);
        });

        it('should throw on invalid data', () => {
            const schema = z.object({
                name: z.string(),
                age: z.number(),
            });

            const data = { name: 'John', age: 'thirty' };

            expect(() => validateWithZod(schema, data)).toThrow();
        });

        it('should coerce types when possible', () => {
            const schema = z.object({
                age: z.number(),
            });

            const data = { age: 30 };
            const result = validateWithZod(schema, data);

            expect(result.age).toBe(30);
        });
    });

    describe('safeValidateWithZod', () => {
        it('should return success for valid data', () => {
            const schema = z.object({
                name: z.string(),
                age: z.number(),
            });

            const data = { name: 'John', age: 30 };
            const result = safeValidateWithZod(schema, data);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(data);
            }
        });

        it('should return error for invalid data', () => {
            const schema = z.object({
                name: z.string(),
                age: z.number(),
            });

            const data = { name: 'John', age: 'thirty' };
            const result = safeValidateWithZod(schema, data);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBeDefined();
                expect(result.error.issues).toBeDefined();
            }
        });

        it('should handle optional fields', () => {
            const schema = z.object({
                name: z.string(),
                email: z.string().email().optional(),
            });

            const data = { name: 'John' };
            const result = safeValidateWithZod(schema, data);

            expect(result.success).toBe(true);
        });

        it('should validate email format', () => {
            const schema = z.object({
                email: z.string().email(),
            });

            const validData = { email: 'test@example.com' };
            const validResult = safeValidateWithZod(schema, validData);
            expect(validResult.success).toBe(true);

            const invalidData = { email: 'not-an-email' };
            const invalidResult = safeValidateWithZod(schema, invalidData);
            expect(invalidResult.success).toBe(false);
        });
    });

    describe('zodSchemaToMCPParameters - description inheritance', () => {
        it('should inherit description from inner schema of optional when outer has no description', () => {
            // This triggers line 244-245 - optional without own description, inner has description
            const schema = z.object({
                field: z.string().describe('Inner description').optional(),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0].description).toBe('Inner description');
            expect(parameters[0].required).toBe(false);
        });

        it('should not override existing description for optional', () => {
            // Test when optional wrapper has its own description
            const schema = z.object({
                field: z
                    .string()
                    .describe('Inner description')
                    .optional()
                    .describe('Outer description'),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0].description).toBe('Outer description');
            expect(parameters[0].required).toBe(false);
        });

        it('should inherit description from inner schema of default when outer has no description', () => {
            // This triggers line 255-256 - default without own description, inner has description
            const schema = z.object({
                field: z.string().describe('Inner description').default('test'),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0].description).toBe('Inner description');
            expect(parameters[0].default).toBe('test');
        });

        it('should not override existing description for default', () => {
            // Test when default wrapper has its own description
            const schema = z.object({
                field: z
                    .string()
                    .describe('Inner description')
                    .default('test')
                    .describe('Outer description'),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0].description).toBe('Outer description');
            expect(parameters[0].default).toBe('test');
        });

        it('should inherit description from inner schema of nullable when outer has no description', () => {
            // This triggers line 264-265 - nullable without own description, inner has description
            const schema = z.object({
                field: z.string().describe('Inner description').nullable(),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0].description).toBe('Inner description');
        });

        it('should not override existing description for nullable', () => {
            // Test when nullable wrapper has its own description
            const schema = z.object({
                field: z
                    .string()
                    .describe('Inner description')
                    .nullable()
                    .describe('Outer description'),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0].description).toBe('Outer description');
        });

        it('should handle complex nested wrappers with description inheritance', () => {
            // Test optional wrapped around default wrapped around nullable
            const schema = z.object({
                complexField: z
                    .string()
                    .describe('Deep inner description')
                    .nullable()
                    .default('test')
                    .optional(),
            });

            const parameters = zodSchemaToMCPParameters(schema);

            expect(parameters[0].description).toBe('Deep inner description');
            expect(parameters[0].required).toBe(false);
            expect(parameters[0].default).toBe('test');
        });
    });
});
