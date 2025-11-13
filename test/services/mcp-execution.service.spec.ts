import { Test, TestingModule } from '@nestjs/testing';
import { ModuleRef } from '@nestjs/core';
import { MCPExecutionService } from '../../src/services/mcp-execution.service';
import {
    MCPGuard,
    MCPInterceptor,
    MCPExecutionContext,
    MCPCallHandler,
    MCPException,
    MCPForbiddenException,
    MCPContextType,
    MCPContext,
} from '../../src/interfaces';

// Mock guard
class TestGuard implements MCPGuard {
    async canActivate(_context: MCPExecutionContext): Promise<boolean> {
        return true;
    }
}

class FailingGuard implements MCPGuard {
    async canActivate(_context: MCPExecutionContext): Promise<boolean> {
        return false;
    }
}

// Mock interceptor
class TestInterceptor implements MCPInterceptor {
    async intercept(
        _context: MCPExecutionContext,
        next: MCPCallHandler,
    ): Promise<unknown> {
        return next.handle();
    }
}

class ModifyingInterceptor implements MCPInterceptor {
    async intercept(
        _context: MCPExecutionContext,
        next: MCPCallHandler,
    ): Promise<unknown> {
        const result = await next.handle();
        return { modified: true, result };
    }
}

describe('MCPExecutionService', () => {
    let service: MCPExecutionService;
    let moduleRef: jest.Mocked<ModuleRef>;

    const mockContext: MCPExecutionContext = {
        getRequest: () => ({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {},
        }),
        getType: () => MCPContextType.TOOL,
        getClass: () => TestGuard as unknown as never,
        getHandler: () => 'test' as never,
        getArgs: () => [],
        getMetadata: () => undefined,
        getAllMetadata: () => ({}),
        switchToMcp: () => ({}) as unknown as MCPContext,
    };

    beforeEach(async () => {
        const mockModuleRef = {
            create: jest.fn(),
            get: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MCPExecutionService,
                {
                    provide: ModuleRef,
                    useValue: mockModuleRef,
                },
            ],
        }).compile();

        service = module.get<MCPExecutionService>(MCPExecutionService);
        moduleRef = module.get(ModuleRef);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('executeGuards', () => {
        it('should return true when no guards provided', async () => {
            const result = await service.executeGuards([], mockContext);
            expect(result).toBe(true);
        });

        it('should return true when all guards pass', async () => {
            const guard = new TestGuard();
            moduleRef.create.mockResolvedValue(guard);

            const result = await service.executeGuards(
                [TestGuard],
                mockContext,
            );

            expect(result).toBe(true);
            expect(moduleRef.create).toHaveBeenCalledWith(TestGuard);
        });

        it('should throw MCPForbiddenException when guard fails', async () => {
            const guard = new FailingGuard();
            moduleRef.create.mockResolvedValue(guard);

            await expect(
                service.executeGuards([FailingGuard], mockContext),
            ).rejects.toThrow(MCPForbiddenException);
        });

        it('should execute multiple guards in order', async () => {
            const order: number[] = [];
            class Guard1 implements MCPGuard {
                async canActivate(): Promise<boolean> {
                    order.push(1);
                    return true;
                }
            }
            class Guard2 implements MCPGuard {
                async canActivate(): Promise<boolean> {
                    order.push(2);
                    return true;
                }
            }

            moduleRef.create
                .mockResolvedValueOnce(new Guard1())
                .mockResolvedValueOnce(new Guard2());

            await service.executeGuards([Guard1, Guard2], mockContext);

            expect(order).toEqual([1, 2]);
        });

        it('should stop at first failing guard', async () => {
            const order: number[] = [];
            class Guard1 implements MCPGuard {
                async canActivate(): Promise<boolean> {
                    order.push(1);
                    return false;
                }
            }
            class Guard2 implements MCPGuard {
                async canActivate(): Promise<boolean> {
                    order.push(2);
                    return true;
                }
            }

            moduleRef.create.mockResolvedValueOnce(new Guard1());

            await expect(
                service.executeGuards([Guard1, Guard2], mockContext),
            ).rejects.toThrow(MCPForbiddenException);

            expect(order).toEqual([1]);
            expect(moduleRef.create).toHaveBeenCalledTimes(1);
        });

        it('should use existing instance if create fails', async () => {
            const guard = new TestGuard();
            moduleRef.create.mockRejectedValue(new Error('Create failed'));
            moduleRef.get.mockReturnValue(guard);

            const result = await service.executeGuards(
                [TestGuard],
                mockContext,
            );

            expect(result).toBe(true);
            expect(moduleRef.create).toHaveBeenCalledWith(TestGuard);
            expect(moduleRef.get).toHaveBeenCalledWith(TestGuard, {
                strict: false,
            });
        });

        it('should throw MCPException if both create and get fail', async () => {
            moduleRef.create.mockRejectedValue(new Error('Create failed'));
            moduleRef.get.mockImplementation(() => {
                throw new Error('Get failed');
            });

            await expect(
                service.executeGuards([TestGuard], mockContext),
            ).rejects.toThrow(MCPException);
        });
    });

    describe('executeInterceptors', () => {
        it('should execute handler when no interceptors provided', async () => {
            const handler = jest.fn().mockResolvedValue('result');

            const result = await service.executeInterceptors(
                [],
                mockContext,
                handler,
            );

            expect(result).toBe('result');
            expect(handler).toHaveBeenCalled();
        });

        it('should execute interceptor and handler', async () => {
            const interceptor = new TestInterceptor();
            moduleRef.create.mockResolvedValue(interceptor);

            const handler = jest.fn().mockResolvedValue('result');

            const result = await service.executeInterceptors(
                [TestInterceptor],
                mockContext,
                handler,
            );

            expect(result).toBe('result');
            expect(handler).toHaveBeenCalled();
        });

        it('should allow interceptor to modify result', async () => {
            const interceptor = new ModifyingInterceptor();
            moduleRef.create.mockResolvedValue(interceptor);

            const handler = jest.fn().mockResolvedValue('original');

            const result = await service.executeInterceptors(
                [ModifyingInterceptor],
                mockContext,
                handler,
            );

            expect(result).toEqual({ modified: true, result: 'original' });
        });

        it('should chain multiple interceptors', async () => {
            const order: string[] = [];

            class Interceptor1 implements MCPInterceptor {
                async intercept(
                    _ctx: MCPExecutionContext,
                    next: MCPCallHandler,
                ): Promise<unknown> {
                    order.push('before-1');
                    const result = await next.handle();
                    order.push('after-1');
                    return result;
                }
            }

            class Interceptor2 implements MCPInterceptor {
                async intercept(
                    _ctx: MCPExecutionContext,
                    next: MCPCallHandler,
                ): Promise<unknown> {
                    order.push('before-2');
                    const result = await next.handle();
                    order.push('after-2');
                    return result;
                }
            }

            moduleRef.create
                .mockResolvedValueOnce(new Interceptor1())
                .mockResolvedValueOnce(new Interceptor2());

            const handler = jest.fn().mockImplementation(() => {
                order.push('handler');
                return Promise.resolve('result');
            });

            await service.executeInterceptors(
                [Interceptor1, Interceptor2],
                mockContext,
                handler,
            );

            expect(order).toEqual([
                'before-1',
                'before-2',
                'handler',
                'after-2',
                'after-1',
            ]);
        });

        it('should use existing instance if create fails', async () => {
            const interceptor = new TestInterceptor();
            moduleRef.create.mockRejectedValue(new Error('Create failed'));
            moduleRef.get.mockReturnValue(interceptor);

            const handler = jest.fn().mockResolvedValue('result');

            const result = await service.executeInterceptors(
                [TestInterceptor],
                mockContext,
                handler,
            );

            expect(result).toBe('result');
            expect(moduleRef.create).toHaveBeenCalledWith(TestInterceptor);
            expect(moduleRef.get).toHaveBeenCalledWith(TestInterceptor, {
                strict: false,
            });
        });

        it('should throw MCPException if both create and get fail for interceptor', async () => {
            moduleRef.create.mockRejectedValue(new Error('Create failed'));
            moduleRef.get.mockImplementation(() => {
                throw new Error('Get failed');
            });

            const handler = jest.fn();

            await expect(
                service.executeInterceptors(
                    [TestInterceptor],
                    mockContext,
                    handler,
                ),
            ).rejects.toThrow(MCPException);
        });
    });

    describe('executeWithGuardsAndInterceptors', () => {
        it('should execute guards then interceptors', async () => {
            const order: string[] = [];

            class OrderGuard implements MCPGuard {
                async canActivate(): Promise<boolean> {
                    order.push('guard');
                    return true;
                }
            }

            class OrderInterceptor implements MCPInterceptor {
                async intercept(
                    _ctx: MCPExecutionContext,
                    next: MCPCallHandler,
                ): Promise<unknown> {
                    order.push('interceptor-before');
                    const result = await next.handle();
                    order.push('interceptor-after');
                    return result;
                }
            }

            moduleRef.create
                .mockResolvedValueOnce(new OrderGuard())
                .mockResolvedValueOnce(new OrderInterceptor());

            const handler = jest.fn().mockImplementation(() => {
                order.push('handler');
                return Promise.resolve('result');
            });

            await service.executeWithGuardsAndInterceptors(
                [OrderGuard],
                [OrderInterceptor],
                mockContext,
                handler,
            );

            expect(order).toEqual([
                'guard',
                'interceptor-before',
                'handler',
                'interceptor-after',
            ]);
        });

        it('should not execute interceptors if guard fails', async () => {
            const guard = new FailingGuard();
            moduleRef.create.mockResolvedValue(guard);

            const handler = jest.fn();

            await expect(
                service.executeWithGuardsAndInterceptors(
                    [FailingGuard],
                    [TestInterceptor],
                    mockContext,
                    handler,
                ),
            ).rejects.toThrow(MCPForbiddenException);

            expect(handler).not.toHaveBeenCalled();
        });

        it('should work with empty guards and interceptors', async () => {
            const handler = jest.fn().mockResolvedValue('result');

            const result = await service.executeWithGuardsAndInterceptors(
                [],
                [],
                mockContext,
                handler,
            );

            expect(result).toBe('result');
            expect(handler).toHaveBeenCalled();
        });
    });
});
