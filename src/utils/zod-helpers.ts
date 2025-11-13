import { z } from 'zod';
import { MCPToolParameter } from '../interfaces';

/**
 * Convert a Zod schema to JSON Schema format compatible with MCP protocol
 * This is a simplified converter that handles common Zod types
 */
export function zodToJsonSchema(
    schema: z.ZodTypeAny,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
    if (schema instanceof z.ZodString) {
        const jsonSchema: {
            type: string;
            description?: string;
            enum?: string[];
            minLength?: number;
            maxLength?: number;
        } = { type: 'string' };
        if (schema.description) {
            jsonSchema.description = schema.description;
        }
        // Handle enums
        const checks = (schema as z.ZodString)._def.checks || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        checks.forEach((check: any) => {
            if (check.kind === 'min') {
                jsonSchema.minLength = check.value;
            } else if (check.kind === 'max') {
                jsonSchema.maxLength = check.value;
            }
        });
        return jsonSchema;
    }

    if (schema instanceof z.ZodNumber) {
        const jsonSchema: {
            type: string;
            description?: string;
            minimum?: number;
            maximum?: number;
        } = { type: 'number' };
        if (schema.description) {
            jsonSchema.description = schema.description;
        }
        const checks = (schema as z.ZodNumber)._def.checks || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        checks.forEach((check: any) => {
            if (check.kind === 'min') {
                jsonSchema.minimum = check.value;
            } else if (check.kind === 'max') {
                jsonSchema.maximum = check.value;
            }
        });
        return jsonSchema;
    }

    if (schema instanceof z.ZodBoolean) {
        const jsonSchema: { type: string; description?: string } = {
            type: 'boolean',
        };
        if (schema.description) {
            jsonSchema.description = schema.description;
        }
        return jsonSchema;
    }

    if (schema instanceof z.ZodArray) {
        const jsonSchema: {
            type: string;
            description?: string;
            items?: unknown;
            minItems?: number;
            maxItems?: number;
        } = {
            type: 'array',
            items: zodToJsonSchema(schema.element),
        };
        if (schema.description) {
            jsonSchema.description = schema.description;
        }
        const minLength = schema._def.minLength;
        const maxLength = schema._def.maxLength;
        if (minLength !== null) {
            jsonSchema.minItems = minLength.value;
        }
        if (maxLength !== null) {
            jsonSchema.maxItems = maxLength.value;
        }
        return jsonSchema;
    }

    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const properties: Record<string, any> = {};
        const required: string[] = [];

        Object.keys(shape).forEach((key) => {
            let fieldSchema = shape[key];
            let isOptional = false;

            // Unwrap optional and nullable
            if (fieldSchema instanceof z.ZodOptional) {
                isOptional = true;
                fieldSchema = fieldSchema.unwrap();
            }

            if (fieldSchema instanceof z.ZodNullable) {
                fieldSchema = fieldSchema.unwrap();
            }

            properties[key] = zodToJsonSchema(fieldSchema);

            if (!isOptional) {
                required.push(key);
            }
        });

        const jsonSchema: {
            type: string;
            description?: string;
            properties: unknown;
            required: string[];
            additionalProperties?: boolean;
        } = {
            type: 'object',
            properties,
            required,
        };

        if (schema.description) {
            jsonSchema.description = schema.description;
        }

        return jsonSchema;
    }

    if (schema instanceof z.ZodEnum) {
        const jsonSchema: {
            type: string;
            description?: string;
            enum: unknown[];
        } = {
            type: 'string',
            enum: schema._def.values,
        };
        if (schema.description) {
            jsonSchema.description = schema.description;
        }
        return jsonSchema;
    }

    if (schema instanceof z.ZodLiteral) {
        const jsonSchema: {
            type: string;
            description?: string;
            const: unknown;
        } = {
            type: typeof schema._def.value,
            const: schema._def.value,
        };
        if (schema.description) {
            jsonSchema.description = schema.description;
        }
        return jsonSchema;
    }

    if (schema instanceof z.ZodUnion) {
        const options = schema._def.options;
        return {
            oneOf: options.map((opt: z.ZodTypeAny) => zodToJsonSchema(opt)),
        };
    }

    if (schema instanceof z.ZodOptional) {
        return zodToJsonSchema(schema.unwrap());
    }

    if (schema instanceof z.ZodNullable) {
        const innerSchema = zodToJsonSchema(schema.unwrap());
        return {
            ...innerSchema,
            nullable: true,
        };
    }

    if (schema instanceof z.ZodDefault) {
        const innerSchema = zodToJsonSchema(schema._def.innerType);
        return {
            ...innerSchema,
            default: schema._def.defaultValue(),
        };
    }

    // Fallback for unknown types
    return { type: 'object' };
}

/**
 * Convert a Zod object schema to MCP tool parameters
 * This extracts parameter metadata from Zod schemas for backward compatibility
 */
export function zodSchemaToMCPParameters(
    schema: z.ZodObject<z.ZodRawShape>,
): MCPToolParameter[] {
    const shape = schema.shape;
    const parameters: MCPToolParameter[] = [];

    Object.keys(shape).forEach((key) => {
        let fieldSchema = shape[key];
        let isRequired = true;
        let defaultValue: unknown = undefined;
        let description: string | undefined = undefined;

        // Store description before unwrapping
        description = fieldSchema.description;

        // Unwrap optional
        if (fieldSchema instanceof z.ZodOptional) {
            isRequired = false;
            fieldSchema = fieldSchema.unwrap();
            // Check if inner schema has description
            if (!description && fieldSchema.description) {
                description = fieldSchema.description;
            }
        }

        // Unwrap default
        if (fieldSchema instanceof z.ZodDefault) {
            isRequired = false;
            defaultValue = fieldSchema._def.defaultValue();
            fieldSchema = fieldSchema._def.innerType;
            // Check if inner schema has description
            if (!description && fieldSchema.description) {
                description = fieldSchema.description;
            }
        }

        // Unwrap nullable
        if (fieldSchema instanceof z.ZodNullable) {
            fieldSchema = fieldSchema.unwrap();
            // Check if inner schema has description
            if (!description && fieldSchema.description) {
                description = fieldSchema.description;
            }
        }

        let type: MCPToolParameter['type'] = 'string';
        let enumValues: unknown[] | undefined = undefined;

        if (fieldSchema instanceof z.ZodString) {
            type = 'string';
        } else if (fieldSchema instanceof z.ZodNumber) {
            type = 'number';
        } else if (fieldSchema instanceof z.ZodBoolean) {
            type = 'boolean';
        } else if (fieldSchema instanceof z.ZodArray) {
            type = 'array';
        } else if (fieldSchema instanceof z.ZodObject) {
            type = 'object';
        } else if (fieldSchema instanceof z.ZodEnum) {
            type = 'string';
            enumValues = fieldSchema._def.values;
        }

        const parameter: MCPToolParameter = {
            name: key,
            type,
            description: description || fieldSchema.description,
            required: isRequired,
        };

        if (defaultValue !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parameter.default = defaultValue as any;
        }

        if (enumValues) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parameter.enum = enumValues as any[];
        }

        parameters.push(parameter);
    });

    return parameters;
}

/**
 * Validate input against a Zod schema
 * Returns validated data or throws an error
 */
export function validateWithZod<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

/**
 * Validate input against a Zod schema (safe version)
 * Returns result object with success status and data or error
 */
export function safeValidateWithZod<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
): z.SafeParseReturnType<unknown, T> {
    return schema.safeParse(data);
}
