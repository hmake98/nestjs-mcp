import { SetMetadata } from '@nestjs/common';
import { MCPInterceptorType } from '../interfaces';
import { MCP_INTERCEPTORS_METADATA } from '../constants';

/**
 * Decorator to apply interceptors to MCP tools, resources, or prompts
 * Interceptors wrap handler execution for cross-cutting concerns like logging,
 * transformation, error handling, and performance monitoring
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyToolProvider {
 *   @UseMCPInterceptors(LoggingInterceptor, TimeoutInterceptor)
 *   @MCPTool({
 *     name: 'monitored_tool',
 *     description: 'A tool with logging and timeout'
 *   })
 *   async monitoredTool() {
 *     return 'Result';
 *   }
 * }
 * ```
 *
 * @param interceptors Interceptor classes to apply
 */
export function UseMCPInterceptors(
    ...interceptors: MCPInterceptorType[]
): MethodDecorator {
    return SetMetadata(MCP_INTERCEPTORS_METADATA, interceptors);
}
