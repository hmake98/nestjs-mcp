import { Injectable } from '@nestjs/common';
import {
    MCPGuard,
    MCPExecutionContext,
    MCPUnauthorizedException,
} from '../interfaces';

/**
 * Simple authentication guard based on API key in request metadata
 * Override this class to implement your own authentication logic
 *
 * @example
 * ```typescript
 * @Injectable()
 * class CustomAuthGuard extends AuthGuard {
 *   async canActivate(context: MCPExecutionContext): Promise<boolean> {
 *     const request = context.getRequest();
 *     // Check request headers, JWT tokens, etc.
 *     const apiKey = request.params?.auth?.apiKey;
 *     if (!apiKey || !this.validateApiKey(apiKey)) {
 *       throw new MCPUnauthorizedException('Invalid API key');
 *     }
 *     return true;
 *   }
 * }
 *
 * @Injectable()
 * class MyToolProvider {
 *   @UseMCPGuards(CustomAuthGuard)
 *   @MCPTool({ name: 'secure_tool', description: 'Authenticated tool' })
 *   async secureTool() {
 *     return 'Protected data';
 *   }
 * }
 * ```
 */
@Injectable()
export class AuthGuard implements MCPGuard {
    async canActivate(context: MCPExecutionContext): Promise<boolean> {
        const request = context.getRequest();

        // Example: Check for API key in request params
        // In real implementation, check JWT tokens, session, etc.
        const apiKey = (request.params as Record<string, unknown>)?.auth;

        if (!apiKey || typeof apiKey !== 'string') {
            throw new MCPUnauthorizedException(
                'Authentication required. Provide a valid API key.',
            );
        }

        // Example validation - override this method
        if (!this.validateApiKey(apiKey)) {
            throw new MCPUnauthorizedException('Invalid API key');
        }

        return true;
    }

    /**
     * Validate API key - override this in your implementation
     */
    protected validateApiKey(apiKey: string): boolean {
        // Example implementation - replace with your logic
        // Check against database, environment variables, etc.
        return apiKey.length > 0;
    }
}
