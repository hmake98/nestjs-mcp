// Simple JSON Schema interface for client generation
interface JSONSchema {
    type?: string;
    properties?: Record<string, JSONSchema>;
    required?: string[];
    items?: JSONSchema;
    enum?: unknown[];
    oneOf?: JSONSchema[];
    anyOf?: JSONSchema[];
    description?: string;
}

/**
 * Generates TypeScript type definitions from JSON Schema
 */
export class TypeGenerator {
    /**
     * Convert JSON Schema to TypeScript type string
     */
    static schemaToType(schema: JSONSchema | undefined): string {
        if (!schema) {
            return 'any';
        }

        if (schema.type === 'string') {
            if (schema.enum) {
                return schema.enum.map((v: unknown) => `'${v}'`).join(' | ');
            }
            return 'string';
        }

        if (schema.type === 'number' || schema.type === 'integer') {
            return 'number';
        }

        if (schema.type === 'boolean') {
            return 'boolean';
        }

        if (schema.type === 'array') {
            const itemType = schema.items
                ? this.schemaToType(schema.items as JSONSchema)
                : 'any';
            return `${itemType}[]`;
        }

        if (schema.type === 'object') {
            if (schema.properties) {
                const props = Object.entries(schema.properties)
                    .map(([key, propSchema]) => {
                        const required = schema.required?.includes(key);
                        const optionalMark = required ? '' : '?';
                        const type = this.schemaToType(
                            propSchema as JSONSchema,
                        );
                        return `  ${key}${optionalMark}: ${type};`;
                    })
                    .join('\n');
                return `{\n${props}\n}`;
            }
            return 'Record<string, any>';
        }

        if (schema.oneOf || schema.anyOf) {
            const schemas = schema.oneOf || schema.anyOf || [];
            return schemas
                .map((s: JSONSchema) => this.schemaToType(s as JSONSchema))
                .join(' | ');
        }

        return 'any';
    }

    /**
     * Generate TypeScript interface from schema
     */
    static generateInterface(
        name: string,
        schema: JSONSchema | undefined,
    ): string {
        if (!schema || schema.type !== 'object') {
            return `export type ${name} = ${this.schemaToType(schema)};`;
        }

        const properties = schema.properties || {};
        const required = schema.required || [];

        const props = Object.entries(properties)
            .map(([key, propSchema]) => {
                const isRequired = required.includes(key);
                const optionalMark = isRequired ? '' : '?';
                const type = this.schemaToType(propSchema as JSONSchema);
                const description = (propSchema as JSONSchema).description;
                const comment = description ? `  /** ${description} */\n` : '';
                return `${comment}  ${key}${optionalMark}: ${type};`;
            })
            .join('\n');

        return `export interface ${name} {\n${props}\n}`;
    }

    /**
     * Generate safe type name from string
     */
    static toTypeName(name: string): string {
        return name
            .split(/[^a-zA-Z0-9]+/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
    }
}
