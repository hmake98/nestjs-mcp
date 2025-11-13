import { Injectable } from '@nestjs/common';
import {
    MCPGuard,
    MCPExecutionContext,
    MCPForbiddenException,
} from '../interfaces';

/**
 * Permission-based authorization guard
 * Checks if the user has required permissions to access a resource
 *
 * @example
 * ```typescript
 * @Injectable()
 * class CustomPermissionGuard extends PermissionGuard {
 *   async canActivate(context: MCPExecutionContext): Promise<boolean> {
 *     const request = context.getRequest();
 *     const requiredPermission = context.getMetadata<string>('permission');
 *     const userPermissions = this.getUserPermissions(request);
 *
 *     if (!requiredPermission) return true;
 *     if (!userPermissions.includes(requiredPermission)) {
 *       throw new MCPForbiddenException(`Missing permission: ${requiredPermission}`);
 *     }
 *     return true;
 *   }
 * }
 *
 * // Usage with custom metadata decorator
 * @Injectable()
 * class MyToolProvider {
 *   @RequirePermission('admin')
 *   @UseMCPGuards(CustomPermissionGuard)
 *   @MCPTool({ name: 'admin_tool', description: 'Admin only tool' })
 *   async adminTool() {
 *     return 'Admin data';
 *   }
 * }
 * ```
 */
@Injectable()
export class PermissionGuard implements MCPGuard {
    async canActivate(context: MCPExecutionContext): Promise<boolean> {
        const requiredPermission =
            context.getMetadata<string>('permission') ||
            context.getMetadata<string>('role');

        if (!requiredPermission) {
            // No permission required
            return true;
        }

        const request = context.getRequest();
        const userPermissions = this.extractPermissions(request as never);

        if (!userPermissions.includes(requiredPermission)) {
            throw new MCPForbiddenException(
                `Insufficient permissions. Required: ${requiredPermission}`,
                { required: requiredPermission, provided: userPermissions },
            );
        }

        return true;
    }

    /**
     * Extract user permissions from request - override this
     */
    protected extractPermissions(request: Record<string, unknown>): string[] {
        // Example: extract from request metadata
        const permissions =
            (request.params as Record<string, unknown>)?.permissions || [];
        return Array.isArray(permissions) ? (permissions as string[]) : [];
    }
}
