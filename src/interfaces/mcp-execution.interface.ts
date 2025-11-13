import { Type } from '@nestjs/common';
import { MCPRequest } from './mcp-protocol.interface';

/**
 * Execution context type
 */
export enum MCPContextType {
    TOOL = 'tool',
    RESOURCE = 'resource',
    PROMPT = 'prompt',
}

/**
 * Execution context for MCP operations
 * Provides access to the current request, handler metadata, and execution environment
 */
export interface MCPExecutionContext {
    /**
     * Get the context type (tool, resource, or prompt)
     */
    getType(): MCPContextType;

    /**
     * Get the MCP request
     */
    getRequest(): MCPRequest;

    /**
     * Get the handler class instance
     */
    getClass(): Type<unknown>;

    /**
     * Get the handler method name
     */
    getHandler(): string;

    /**
     * Get handler arguments
     */
    getArgs(): unknown[];

    /**
     * Get handler metadata by key
     */
    getMetadata<T = unknown>(key: string): T | undefined;

    /**
     * Get all handler metadata
     */
    getAllMetadata(): Record<string, unknown>;

    /**
     * Switch to MCP context
     */
    switchToMcp(): MCPContext;
}

/**
 * MCP-specific context information
 */
export interface MCPContext {
    /**
     * Get the MCP request
     */
    getRequest(): MCPRequest;

    /**
     * Get the operation name (tool/resource/prompt name)
     */
    getOperationName(): string;

    /**
     * Get the operation type
     */
    getType(): MCPContextType;

    /**
     * Get custom data attached to the context
     */
    getData<T = unknown>(key: string): T | undefined;

    /**
     * Set custom data on the context
     */
    setData<T = unknown>(key: string, value: T): void;
}

/**
 * Guard interface - determines if an operation can be executed
 */
export interface MCPGuard {
    /**
     * Determine if the operation can proceed
     * @returns true if allowed, false if denied, or throws an exception
     */
    canActivate(context: MCPExecutionContext): boolean | Promise<boolean>;
}

/**
 * Interceptor interface - wraps handler execution for cross-cutting concerns
 */
export interface MCPInterceptor {
    /**
     * Intercept the handler execution
     * @param context Execution context
     * @param next Call handler function
     * @returns The result or a transformed result
     */
    intercept(
        context: MCPExecutionContext,
        next: MCPCallHandler,
    ): Promise<unknown>;
}

/**
 * Call handler - executes the next handler in the chain
 */
export interface MCPCallHandler {
    /**
     * Execute the handler
     */
    handle(): Promise<unknown>;
}

/**
 * Guard constructor type
 */
export type MCPGuardType = Type<MCPGuard>;

/**
 * Interceptor constructor type
 */
export type MCPInterceptorType = Type<MCPInterceptor>;

/**
 * Exception that can be thrown by guards or interceptors
 */
export class MCPException extends Error {
    constructor(
        public readonly code: number,
        message: string,
        public readonly data?: unknown,
    ) {
        super(message);
        this.name = 'MCPException';
    }
}

/**
 * Forbidden exception - thrown when access is denied
 */
export class MCPForbiddenException extends MCPException {
    constructor(message = 'Forbidden', data?: unknown) {
        super(-32001, message, data);
        this.name = 'MCPForbiddenException';
    }
}

/**
 * Unauthorized exception - thrown when authentication is required
 */
export class MCPUnauthorizedException extends MCPException {
    constructor(message = 'Unauthorized', data?: unknown) {
        super(-32002, message, data);
        this.name = 'MCPUnauthorizedException';
    }
}

/**
 * Rate limit exception - thrown when rate limit is exceeded
 */
export class MCPRateLimitException extends MCPException {
    constructor(message = 'Rate limit exceeded', data?: unknown) {
        super(-32003, message, data);
        this.name = 'MCPRateLimitException';
    }
}

/**
 * Timeout exception - thrown when operation times out
 */
export class MCPTimeoutException extends MCPException {
    constructor(message = 'Operation timed out', data?: unknown) {
        super(-32004, message, data);
        this.name = 'MCPTimeoutException';
    }
}
