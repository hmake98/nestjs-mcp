import { SetMetadata } from '@nestjs/common';
import { MCP_RESOURCE_METADATA } from '../constants';
import {
    MCPResourceMetadata,
    MCPResourceTemplateMetadata,
} from '../interfaces/mcp-resource.interface';

/**
 * Decorator to mark a method as an MCP resource provider
 * @param metadata Resource metadata
 */
export function MCPResource(metadata: MCPResourceMetadata): MethodDecorator {
    return (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) => {
        SetMetadata(MCP_RESOURCE_METADATA, metadata)(
            target,
            propertyKey,
            descriptor,
        );
        return descriptor;
    };
}

/**
 * Decorator to mark a method as an MCP resource template provider
 * Used for dynamic resources that follow a URI pattern
 * @param metadata Resource template metadata
 */
export function MCPResourceTemplate(
    metadata: MCPResourceTemplateMetadata,
): MethodDecorator {
    return (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) => {
        SetMetadata(MCP_RESOURCE_METADATA, { ...metadata, isTemplate: true })(
            target,
            propertyKey,
            descriptor,
        );
        return descriptor;
    };
}
