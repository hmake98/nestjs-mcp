import { Test, TestingModule } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { MCPModule } from '../../src/modules';
import {
    MCPTool,
    UseMCPGuards,
    UseMCPInterceptors,
} from '../../src/decorators';
import {
    MCPGuard,
    MCPInterceptor,
    MCPExecutionContext,
    MCPCallHandler,
    MCPUnauthorizedException,
} from '../../src/interfaces';
import { MCPService } from '../../src/services';

// Test guard
@Injectable()
class TestGuard implements MCPGuard {
    async canActivate(context: MCPExecutionContext): Promise<boolean> {
        const request = context.getRequest();
        const auth = (request.params as Record<string, unknown>)?.testAuth;
        if (!auth) {
            throw new MCPUnauthorizedException('Test auth required');
        }
        return true;
    }
}

// Test interceptor
@Injectable()
class TestInterceptor implements MCPInterceptor {
    async intercept(
        context: MCPExecutionContext,
        next: MCPCallHandler,
    ): Promise<unknown> {
        const result = await next.handle();
        return { intercepted: true, result };
    }
}

// Test tool provider
@Injectable()
class TestToolProvider {
    @MCPTool({ name: 'test_tool', description: 'Test tool' })
    async testTool() {
        return 'test result';
    }

    @UseMCPGuards(TestGuard)
    @MCPTool({ name: 'guarded_tool', description: 'Guarded tool' })
    async guardedTool() {
        return 'guarded result';
    }

    @UseMCPInterceptors(TestInterceptor)
    @MCPTool({ name: 'intercepted_tool', description: 'Intercepted tool' })
    async interceptedTool() {
        return 'intercepted result';
    }

    @UseMCPGuards(TestGuard)
    @UseMCPInterceptors(TestInterceptor)
    @MCPTool({ name: 'both_tool', description: 'Both guard and interceptor' })
    async bothTool() {
        return 'both result';
    }
}

describe('MCP Guards and Interceptors Integration', () => {
    let mcpService: MCPService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MCPModule.forRoot({
                    serverInfo: {
                        name: 'test-server',
                        version: '1.0.0',
                    },
                    enableLogging: false,
                }),
            ],
            providers: [TestToolProvider, TestGuard, TestInterceptor],
        }).compile();

        mcpService = module.get<MCPService>(MCPService);
        await module.init();
    });

    describe('Basic tool execution', () => {
        it('should execute unguarded tool', async () => {
            const request = {
                jsonrpc: '2.0' as const,
                id: 1,
                method: 'tools/call',
                params: {
                    name: 'test_tool',
                    arguments: {},
                },
            };

            const response = await mcpService.handleRequest(request);
            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(1);
            expect(
                (response as Record<string, unknown>).result.content[0].text,
            ).toContain('test result');
        });
    });

    describe('Guard execution', () => {
        it('should block access when guard fails', async () => {
            const request = {
                jsonrpc: '2.0' as const,
                id: 1,
                method: 'tools/call',
                params: {
                    name: 'guarded_tool',
                    arguments: {},
                },
            };

            const response = await mcpService.handleRequest(request);
            expect((response as Record<string, unknown>).error).toBeDefined();
            expect(
                (response as Record<string, unknown>).error.message,
            ).toContain('Test auth');
        });

        it('should allow access when guard passes', async () => {
            const request = {
                jsonrpc: '2.0' as const,
                id: 1,
                method: 'tools/call',
                params: {
                    name: 'guarded_tool',
                    arguments: {},
                    testAuth: true,
                },
            };

            const response = await mcpService.handleRequest(request);
            expect(response.jsonrpc).toBe('2.0');
            expect(
                (response as Record<string, unknown>).result.content[0].text,
            ).toContain('guarded result');
        });
    });

    describe('Interceptor execution', () => {
        it('should intercept and transform result', async () => {
            const request = {
                jsonrpc: '2.0' as const,
                id: 1,
                method: 'tools/call',
                params: {
                    name: 'intercepted_tool',
                    arguments: {},
                },
            };

            const response = await mcpService.handleRequest(request);
            expect(response.jsonrpc).toBe('2.0');
            const content = (response as Record<string, unknown>).result
                .content[0].text;
            expect(content).toContain('intercepted');
        });
    });

    describe('Guard + Interceptor execution', () => {
        it('should execute guard before interceptor and fail', async () => {
            const request = {
                jsonrpc: '2.0' as const,
                id: 1,
                method: 'tools/call',
                params: {
                    name: 'both_tool',
                    arguments: {},
                },
            };

            const response = await mcpService.handleRequest(request);
            expect((response as Record<string, unknown>).error).toBeDefined();
            expect(
                (response as Record<string, unknown>).error.message,
            ).toContain('Test auth');
        });

        it('should execute both guard and interceptor when guard passes', async () => {
            const request = {
                jsonrpc: '2.0' as const,
                id: 1,
                method: 'tools/call',
                params: {
                    name: 'both_tool',
                    arguments: {},
                    testAuth: true,
                },
            };

            const response = await mcpService.handleRequest(request);
            expect(response.jsonrpc).toBe('2.0');
            const content = (response as Record<string, unknown>).result
                .content[0].text;
            expect(content).toContain('intercepted');
            expect(content).toContain('both result');
        });
    });
});
