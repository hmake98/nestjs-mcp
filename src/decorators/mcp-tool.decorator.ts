import { SetMetadata } from '@nestjs/common';
import { MCP_TOOL_METADATA, MCP_TOOL_PARAM_METADATA } from '../constants';
import { MCPToolParameter } from '../interfaces';
import {
    MCPToolMetadata,
    MCPToolWithParamsMetadata,
} from '../interfaces/mcp-tool.interface';

/**
 * Decorator to mark a method as an MCP tool
 * @param metadata Tool metadata including name and description
 */
export function MCPTool(metadata: MCPToolMetadata): MethodDecorator {
    return (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) => {
        SetMetadata(MCP_TOOL_METADATA, metadata)(
            target,
            propertyKey,
            descriptor,
        );
        return descriptor;
    };
}

/**
 * Decorator to define parameters for an MCP tool
 * @param parameters Array of tool parameters
 */
export function MCPToolParams(
    parameters: Omit<MCPToolParameter, 'name'>[],
): MethodDecorator {
    return (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) => {
        SetMetadata(MCP_TOOL_PARAM_METADATA, parameters)(
            target,
            propertyKey,
            descriptor,
        );
        return descriptor;
    };
}

export function MCPToolWithParams(
    metadata: MCPToolWithParamsMetadata,
): MethodDecorator {
    return (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) => {
        const { parameters, ...toolMetadata } = metadata;
        SetMetadata(MCP_TOOL_METADATA, toolMetadata)(
            target,
            propertyKey,
            descriptor,
        );
        SetMetadata(MCP_TOOL_PARAM_METADATA, parameters)(
            target,
            propertyKey,
            descriptor,
        );
        return descriptor;
    };
}
