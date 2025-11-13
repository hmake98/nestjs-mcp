import { z } from 'zod';
import {
    zodToJsonSchema,
    zodSchemaToMCPParameters,
    validateWithZod,
    safeValidateWithZod,
} from '../../src/utils/zod-helpers';

describe('Zod Helpers', () => {
    describe('zodToJsonSchema', () => {
        it('should convert ZodString to JSON Schema', () => {
            const schema = z.string().describe('A string field');
            const jsonSchema = zodToJsonSchema(schema);

            expect(jsonSchema).toEqual({
                type: 'string',
                description: 'A string field',
            });
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
});
