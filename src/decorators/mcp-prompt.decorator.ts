import { SetMetadata } from '@nestjs/common';
import { MCP_PROMPT_METADATA } from '../constants';
import { MCPPromptMetadata } from 'src/interfaces/mcp-prompt.interface';

/**
 * Decorator to mark a method as an MCP prompt provider
 * @param metadata Prompt metadata
 */
export function MCPPrompt(metadata: MCPPromptMetadata): MethodDecorator {
    return (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) => {
        SetMetadata(MCP_PROMPT_METADATA, metadata)(
            target,
            propertyKey,
            descriptor,
        );
        return descriptor;
    };
}
