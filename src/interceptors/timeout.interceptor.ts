import { Injectable } from '@nestjs/common';
import {
    MCPInterceptor,
    MCPExecutionContext,
    MCPCallHandler,
    MCPTimeoutException,
} from '../interfaces';

/**
 * Timeout interceptor - ensures operations complete within a time limit
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyToolProvider {
 *   @UseMCPInterceptors(new TimeoutInterceptor(5000)) // 5 second timeout
 *   @MCPTool({ name: 'slow_tool', description: 'Tool with timeout' })
 *   async slowTool() {
 *     // Long running operation
 *     return 'Result';
 *   }
 * }
 * ```
 */
@Injectable()
export class TimeoutInterceptor implements MCPInterceptor {
    constructor(private readonly timeout: number = 30000) {} // 30 seconds default

    async intercept(
        context: MCPExecutionContext,
        next: MCPCallHandler,
    ): Promise<unknown> {
        const mcpContext = context.switchToMcp();
        const operationName = mcpContext.getOperationName();

        const timeoutPromise = new Promise<never>((_, reject) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const timer = (globalThis as any).setTimeout(() => {
                reject(
                    new MCPTimeoutException(
                        `Operation '${operationName}' timed out after ${this.timeout}ms`,
                        { timeout: this.timeout, operation: operationName },
                    ),
                );
            }, this.timeout);
            // Store timer for potential cleanup
            void timer;
        });

        return Promise.race([next.handle(), timeoutPromise]);
    }
}
