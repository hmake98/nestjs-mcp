import { Injectable } from '@nestjs/common';
import {
    MCPInterceptor,
    MCPExecutionContext,
    MCPCallHandler,
    MCPException,
} from '../interfaces';
import { MCPErrorCode } from '../constants';

/**
 * Error mapping interceptor - transforms errors into consistent MCP exceptions
 * Maps common error types to appropriate MCP error codes
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyToolProvider {
 *   @UseMCPInterceptors(ErrorMappingInterceptor)
 *   @MCPTool({ name: 'my_tool', description: 'Tool with error mapping' })
 *   async myTool() {
 *     throw new Error('Database connection failed');
 *     // Will be mapped to MCPException with appropriate code
 *   }
 * }
 * ```
 */
@Injectable()
export class ErrorMappingInterceptor implements MCPInterceptor {
    async intercept(
        context: MCPExecutionContext,
        next: MCPCallHandler,
    ): Promise<unknown> {
        try {
            return await next.handle();
        } catch (error) {
            // Already an MCP exception, pass through
            if (error instanceof MCPException) {
                throw error;
            }

            // Map common error types
            throw this.mapError(error);
        }
    }

    /**
     * Map errors to MCP exceptions - override this to customize
     */
    protected mapError(error: unknown): MCPException {
        if (error instanceof Error) {
            // Map specific error messages or types
            if (error.message.includes('not found')) {
                return new MCPException(
                    MCPErrorCode.METHOD_NOT_FOUND,
                    error.message,
                );
            }

            if (
                error.message.includes('invalid') ||
                error.message.includes('validation')
            ) {
                return new MCPException(
                    MCPErrorCode.INVALID_PARAMS,
                    error.message,
                );
            }

            if (
                error.message.includes('permission') ||
                error.message.includes('unauthorized')
            ) {
                return new MCPException(-32001, error.message);
            }

            // Default to internal error
            return new MCPException(MCPErrorCode.INTERNAL_ERROR, error.message);
        }

        // Unknown error type
        return new MCPException(
            MCPErrorCode.INTERNAL_ERROR,
            'An unknown error occurred',
        );
    }
}
