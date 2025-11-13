import { Type } from '@nestjs/common';
import {
    MCPExecutionContext,
    MCPContext,
    MCPContextType,
    MCPRequest,
} from '../interfaces';

/**
 * Implementation of MCPContext
 */
export class MCPContextImpl implements MCPContext {
    private readonly customData = new Map<string, unknown>();

    constructor(
        private readonly request: MCPRequest,
        private readonly operationName: string,
        private readonly type: MCPContextType,
    ) {}

    getRequest(): MCPRequest {
        return this.request;
    }

    getOperationName(): string {
        return this.operationName;
    }

    getType(): MCPContextType {
        return this.type;
    }

    getData<T = unknown>(key: string): T | undefined {
        return this.customData.get(key) as T | undefined;
    }

    setData<T = unknown>(key: string, value: T): void {
        this.customData.set(key, value);
    }
}

/**
 * Implementation of MCPExecutionContext
 */
export class MCPExecutionContextImpl implements MCPExecutionContext {
    private readonly mcpContext: MCPContextImpl;

    constructor(
        private readonly type: MCPContextType,
        private readonly request: MCPRequest,
        private readonly classRef: Type<unknown>,
        private readonly handler: string,
        private readonly args: unknown[],
        private readonly metadata: Record<string, unknown>,
        private readonly operationName: string,
    ) {
        this.mcpContext = new MCPContextImpl(request, operationName, type);
    }

    getType(): MCPContextType {
        return this.type;
    }

    getRequest(): MCPRequest {
        return this.request;
    }

    getClass(): Type<unknown> {
        return this.classRef;
    }

    getHandler(): string {
        return this.handler;
    }

    getArgs(): unknown[] {
        return this.args;
    }

    getMetadata<T = unknown>(key: string): T | undefined {
        return this.metadata[key] as T | undefined;
    }

    getAllMetadata(): Record<string, unknown> {
        return { ...this.metadata };
    }

    switchToMcp(): MCPContext {
        return this.mcpContext;
    }
}
