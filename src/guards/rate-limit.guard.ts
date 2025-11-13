import { Injectable } from '@nestjs/common';
import {
    MCPGuard,
    MCPExecutionContext,
    MCPRateLimitException,
} from '../interfaces';

/**
 * Rate limit configuration per operation
 */
interface RateLimitConfig {
    /**
     * Maximum number of requests
     */
    limit: number;
    /**
     * Time window in milliseconds
     */
    window: number;
}

/**
 * Rate limit guard - limits the number of requests per time window
 * This is a simple in-memory implementation. For production, use Redis or similar.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyToolProvider {
 *   @UseMCPGuards(RateLimitGuard)
 *   @MCPTool({ name: 'expensive_tool', description: 'Rate limited tool' })
 *   async expensiveTool() {
 *     return 'Result';
 *   }
 * }
 * ```
 */
@Injectable()
export class RateLimitGuard implements MCPGuard {
    private readonly requests = new Map<
        string,
        { count: number; resetAt: number }
    >();
    private readonly config: RateLimitConfig;

    constructor(config?: Partial<RateLimitConfig>) {
        this.config = {
            limit: config?.limit ?? 10,
            window: config?.window ?? 60000, // 1 minute
        };
    }

    async canActivate(context: MCPExecutionContext): Promise<boolean> {
        const mcpContext = context.switchToMcp();
        const operationName = mcpContext.getOperationName();
        const key = `ratelimit:${operationName}`;

        const now = Date.now();
        const entry = this.requests.get(key);

        // Clean up expired entries periodically
        if (entry && now > entry.resetAt) {
            this.requests.delete(key);
        }

        const current = this.requests.get(key);

        if (!current) {
            // First request
            this.requests.set(key, {
                count: 1,
                resetAt: now + this.config.window,
            });
            return true;
        }

        if (current.count >= this.config.limit) {
            const retryAfter = Math.ceil((current.resetAt - now) / 1000);
            throw new MCPRateLimitException(
                `Rate limit exceeded for ${operationName}. Try again in ${retryAfter}s`,
                { retryAfter, limit: this.config.limit },
            );
        }

        current.count++;
        return true;
    }
}
