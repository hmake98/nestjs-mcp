import { Test, TestingModule } from '@nestjs/testing';
import { MCPService } from '../../src/services/mcp.service';
import { MCPGrpcAdapter } from '../../src/transports/grpc.adapter';
import { MCPRedisAdapter } from '../../src/transports/redis.adapter';
import { MCPWebSocketAdapter } from '../../src/transports/websocket.adapter';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Transport Dynamic Imports', () => {
    let mcpService: MCPService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: MCPService,
                    useValue: {
                        handleRequest: jest.fn(),
                    },
                },
            ],
        }).compile();

        mcpService = module.get<MCPService>(MCPService);
    });

    describe('MCPGrpcAdapter', () => {
        it('should not load dependencies until start() is called', () => {
            const adapter = new MCPGrpcAdapter(mcpService, {
                port: 50051,
            });

            // Just instantiating the adapter should not throw
            expect(adapter).toBeDefined();
            expect((adapter as any).grpc).toBeNull();
            expect((adapter as any).protoLoader).toBeNull();
        });

        it('should have loadGrpcDependencies method', () => {
            const adapter = new MCPGrpcAdapter(mcpService, {
                port: 50051,
            });

            expect((adapter as any).loadGrpcDependencies).toBeDefined();
            expect(typeof (adapter as any).loadGrpcDependencies).toBe(
                'function',
            );
        });
    });

    describe('MCPRedisAdapter', () => {
        it('should not load dependencies until start() is called', () => {
            const adapter = new MCPRedisAdapter(mcpService, {
                host: 'localhost',
                port: 6379,
            });

            // Just instantiating the adapter should not throw
            expect(adapter).toBeDefined();
            expect((adapter as any).Redis).toBeNull();
        });

        it('should have loadRedisDependency method', () => {
            const adapter = new MCPRedisAdapter(mcpService, {
                host: 'localhost',
                port: 6379,
            });

            expect((adapter as any).loadRedisDependency).toBeDefined();
            expect(typeof (adapter as any).loadRedisDependency).toBe(
                'function',
            );
        });
    });

    describe('MCPWebSocketAdapter', () => {
        it('should not load dependencies until start() is called', () => {
            const adapter = new MCPWebSocketAdapter(mcpService, {
                port: 3001,
            });

            // Just instantiating the adapter should not throw
            expect(adapter).toBeDefined();
            expect((adapter as any).ws).toBeNull();
        });

        it('should have loadWsDependency method', () => {
            const adapter = new MCPWebSocketAdapter(mcpService, {
                port: 3001,
            });

            expect((adapter as any).loadWsDependency).toBeDefined();
            expect(typeof (adapter as any).loadWsDependency).toBe('function');
        });
    });

    describe('Lazy Loading Structure', () => {
        it('should have null dependencies on instantiation for all adapters', () => {
            const grpcAdapter = new MCPGrpcAdapter(mcpService, {
                port: 50051,
            });
            const redisAdapter = new MCPRedisAdapter(mcpService, {
                host: 'localhost',
                port: 6379,
            });
            const wsAdapter = new MCPWebSocketAdapter(mcpService, {
                port: 3001,
            });

            // All adapters should have null dependencies on instantiation
            expect((grpcAdapter as any).grpc).toBeNull();
            expect((grpcAdapter as any).protoLoader).toBeNull();
            expect((redisAdapter as any).Redis).toBeNull();
            expect((wsAdapter as any).ws).toBeNull();
        });

        it('should support multiple adapter instances without conflicts', () => {
            const adapter1 = new MCPGrpcAdapter(mcpService, {
                port: 50051,
            });
            const adapter2 = new MCPGrpcAdapter(mcpService, {
                port: 50052,
            });

            expect(adapter1).not.toBe(adapter2);
            expect((adapter1 as any).grpc).toBeNull();
            expect((adapter2 as any).grpc).toBeNull();
        });
    });
});
