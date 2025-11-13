import { Injectable } from '@nestjs/common';
import {
    MCPInterceptor,
    MCPExecutionContext,
    MCPCallHandler,
} from '../interfaces';
import { MCPLogger, LogLevel } from '../utils';

/**
 * Logging interceptor - logs before and after handler execution
 * Includes timing information and error logging
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyToolProvider {
 *   @UseMCPInterceptors(LoggingInterceptor)
 *   @MCPTool({ name: 'my_tool', description: 'Logged tool' })
 *   async myTool() {
 *     return 'Result';
 *   }
 * }
 * ```
 */
@Injectable()
export class LoggingInterceptor implements MCPInterceptor {
    private readonly logger: MCPLogger;

    constructor(logLevel: LogLevel = LogLevel.INFO) {
        this.logger = new MCPLogger(LoggingInterceptor.name, logLevel);
    }

    async intercept(
        context: MCPExecutionContext,
        next: MCPCallHandler,
    ): Promise<unknown> {
        const mcpContext = context.switchToMcp();
        const operationName = mcpContext.getOperationName();
        const type = mcpContext.getType();
        const startTime = Date.now();

        this.logger.log(`[${type}] ${operationName} - Start`);

        try {
            const result = await next.handle();
            const duration = Date.now() - startTime;

            this.logger.log(
                `[${type}] ${operationName} - Complete (${duration}ms)`,
            );

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage =
                error instanceof Error ? error.message : String(error);

            this.logger.error(
                `[${type}] ${operationName} - Error (${duration}ms): ${errorMessage}`,
            );

            throw error;
        }
    }
}
