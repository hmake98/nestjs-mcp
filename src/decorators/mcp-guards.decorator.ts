import { SetMetadata } from '@nestjs/common';
import { MCPGuardType } from '../interfaces';
import { MCP_GUARDS_METADATA } from '../constants';

/**
 * Decorator to apply guards to MCP tools, resources, or prompts
 * Guards control access and determine if an operation can execute
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyToolProvider {
 *   @UseMCPGuards(AuthGuard, RateLimitGuard)
 *   @MCPTool({
 *     name: 'secure_tool',
 *     description: 'A secured tool'
 *   })
 *   async secureTool() {
 *     return 'Protected data';
 *   }
 * }
 * ```
 *
 * @param guards Guard classes to apply
 */
export function UseMCPGuards(...guards: MCPGuardType[]): MethodDecorator {
    return SetMetadata(MCP_GUARDS_METADATA, guards);
}
