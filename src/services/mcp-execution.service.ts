import { Injectable, Optional, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
    MCPGuard,
    MCPInterceptor,
    MCPExecutionContext,
    MCPCallHandler,
    MCPException,
    MCPGuardType,
    MCPInterceptorType,
    MCPForbiddenException,
} from '../interfaces';

/**
 * Service for executing guards and interceptors in the MCP execution pipeline
 */
@Injectable()
export class MCPExecutionService {
    constructor(@Optional() private readonly moduleRef?: ModuleRef) {}

    /**
     * Execute guards before handler
     * @returns true if all guards pass, throws exception otherwise
     */
    async executeGuards(
        guardTypes: unknown[],
        context: MCPExecutionContext,
    ): Promise<boolean> {
        if (!guardTypes || guardTypes.length === 0) {
            return true;
        }

        for (const GuardType of guardTypes as MCPGuardType[]) {
            const guard = await this.resolveGuard(GuardType);
            const canActivate = await guard.canActivate(context);

            if (!canActivate) {
                throw new MCPForbiddenException(
                    `Guard ${GuardType.name} denied access`,
                );
            }
        }

        return true;
    }

    /**
     * Execute interceptors around handler
     */
    async executeInterceptors(
        interceptorTypes: unknown[],
        context: MCPExecutionContext,
        handler: () => Promise<unknown>,
    ): Promise<unknown> {
        if (!interceptorTypes || interceptorTypes.length === 0) {
            return handler();
        }

        // Build interceptor chain
        const interceptors: MCPInterceptor[] = [];

        // Resolve all interceptors
        for (const InterceptorType of interceptorTypes as MCPInterceptorType[]) {
            const interceptor = await this.resolveInterceptor(InterceptorType);
            interceptors.push(interceptor);
        }

        // Create call handler that chains to the next interceptor or final handler
        const createCallHandler = (currentIndex: number): MCPCallHandler => {
            return {
                handle: async () => {
                    if (currentIndex < interceptors.length) {
                        // Call next interceptor
                        return interceptors[currentIndex].intercept(
                            context,
                            createCallHandler(currentIndex + 1),
                        );
                    } else {
                        // Call final handler
                        return handler();
                    }
                },
            };
        };

        // Start the chain
        return createCallHandler(0).handle();
    }

    /**
     * Execute guards and interceptors together
     */
    async executeWithGuardsAndInterceptors(
        guardTypes: unknown[],
        interceptorTypes: unknown[],
        context: MCPExecutionContext,
        handler: () => Promise<unknown>,
    ): Promise<unknown> {
        // Execute guards first
        await this.executeGuards(guardTypes, context);

        // Then execute interceptors (which will call the handler)
        return this.executeInterceptors(interceptorTypes, context, handler);
    }

    /**
     * Resolve guard instance from module container
     */
    private async resolveGuard(GuardType: Type<MCPGuard>): Promise<MCPGuard> {
        if (!this.moduleRef) {
            // Fallback: create instance directly if moduleRef is not available
            try {
                return new GuardType();
            } catch {
                throw new MCPException(
                    -32603,
                    `Failed to resolve guard: ${GuardType.name}. ModuleRef not available.`,
                );
            }
        }

        try {
            return await this.moduleRef.create(GuardType);
        } catch {
            // If creation fails, try to get existing instance
            try {
                return this.moduleRef.get(GuardType, { strict: false });
            } catch {
                throw new MCPException(
                    -32603,
                    `Failed to resolve guard: ${GuardType.name}`,
                );
            }
        }
    }

    /**
     * Resolve interceptor instance from module container
     */
    private async resolveInterceptor(
        InterceptorType: Type<MCPInterceptor>,
    ): Promise<MCPInterceptor> {
        if (!this.moduleRef) {
            // Fallback: create instance directly if moduleRef is not available
            try {
                return new InterceptorType();
            } catch {
                throw new MCPException(
                    -32603,
                    `Failed to resolve interceptor: ${InterceptorType.name}. ModuleRef not available.`,
                );
            }
        }

        try {
            return await this.moduleRef.create(InterceptorType);
        } catch {
            // If creation fails, try to get existing instance
            try {
                return this.moduleRef.get(InterceptorType, { strict: false });
            } catch {
                throw new MCPException(
                    -32603,
                    `Failed to resolve interceptor: ${InterceptorType.name}`,
                );
            }
        }
    }
}
