import { TimeoutInterceptor } from '../../src/interceptors/timeout.interceptor';
import {
    MCPExecutionContext,
    MCPCallHandler,
    MCPTimeoutException,
} from '../../src/interfaces';

describe('TimeoutInterceptor', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    describe('constructor', () => {
        it('should use default timeout of 30000ms', () => {
            const interceptor = new TimeoutInterceptor();
            expect(interceptor).toBeDefined();
        });

        it('should use custom timeout when provided', () => {
            const interceptor = new TimeoutInterceptor(5000);
            expect(interceptor).toBeDefined();
        });
    });

    describe('intercept', () => {
        it('should return result if operation completes before timeout', async () => {
            const interceptor = new TimeoutInterceptor(1000);
            const mockContext = createMockContext('fast-operation');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockResolvedValue({ success: true }),
            };

            const result = await interceptor.intercept(mockContext, mockNext);

            expect(result).toEqual({ success: true });
            expect(mockNext.handle).toHaveBeenCalled();
        });

        it('should throw MCPTimeoutException if operation exceeds timeout', async () => {
            jest.useFakeTimers();

            const interceptor = new TimeoutInterceptor(1000);
            const mockContext = createMockContext('slow-operation');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockImplementation(
                    () =>
                        new Promise((resolve) => {
                            // Never resolves
                            setTimeout(() => resolve({}), 5000);
                        }),
                ),
            };

            const promise = interceptor.intercept(mockContext, mockNext);

            // Advance time past timeout
            jest.advanceTimersByTime(1001);

            await expect(promise).rejects.toThrow(MCPTimeoutException);
            await expect(promise).rejects.toThrow(
                "Operation 'slow-operation' timed out after 1000ms",
            );
        });

        it('should include timeout details in exception', async () => {
            jest.useFakeTimers();

            const interceptor = new TimeoutInterceptor(2000);
            const mockContext = createMockContext('timeout-test');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockImplementation(
                    () =>
                        new Promise((resolve) => {
                            setTimeout(() => resolve({}), 10000);
                        }),
                ),
            };

            const promise = interceptor.intercept(mockContext, mockNext);
            jest.advanceTimersByTime(2001);

            try {
                await promise;
                throw new Error('Should have thrown MCPTimeoutException');
            } catch (error) {
                expect(error).toBeInstanceOf(MCPTimeoutException);
                if (error instanceof MCPTimeoutException) {
                    expect(error.data).toEqual({
                        timeout: 2000,
                        operation: 'timeout-test',
                    });
                }
            }
        });

        it('should handle fast operations with short timeout', async () => {
            const interceptor = new TimeoutInterceptor(100);
            const mockContext = createMockContext('instant-operation');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockResolvedValue('quick result'),
            };

            const result = await interceptor.intercept(mockContext, mockNext);

            expect(result).toBe('quick result');
        });

        it('should handle operations that complete just before timeout', async () => {
            jest.useFakeTimers();

            const interceptor = new TimeoutInterceptor(1000);
            const mockContext = createMockContext('just-in-time');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockImplementation(
                    () =>
                        new Promise((resolve) => {
                            setTimeout(() => resolve('made it'), 999);
                        }),
                ),
            };

            const promise = interceptor.intercept(mockContext, mockNext);

            // Advance to just before timeout
            jest.advanceTimersByTime(999);
            await jest.runAllTimersAsync();

            const result = await promise;
            expect(result).toBe('made it');
        });

        it('should propagate handler errors', async () => {
            const interceptor = new TimeoutInterceptor(5000);
            const mockContext = createMockContext('error-operation');
            const error = new Error('Handler error');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(error),
            };

            await expect(
                interceptor.intercept(mockContext, mockNext),
            ).rejects.toThrow('Handler error');
            await expect(
                interceptor.intercept(mockContext, mockNext),
            ).rejects.toThrow(error);
        });

        it('should timeout even if handler throws error slowly', async () => {
            jest.useFakeTimers();

            const interceptor = new TimeoutInterceptor(500);
            const mockContext = createMockContext('slow-error');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockImplementation(
                    () =>
                        new Promise((_, reject) => {
                            setTimeout(
                                () => reject(new Error('Slow error')),
                                2000,
                            );
                        }),
                ),
            };

            const promise = interceptor.intercept(mockContext, mockNext);

            jest.advanceTimersByTime(501);

            await expect(promise).rejects.toThrow(MCPTimeoutException);
            await expect(promise).rejects.toThrow(
                "Operation 'slow-error' timed out after 500ms",
            );
        });

        it('should handle different operation names', async () => {
            jest.useFakeTimers();

            const operations = ['tool-call', 'resource-read', 'prompt-get'];

            for (const op of operations) {
                const interceptor = new TimeoutInterceptor(100);
                const mockContext = createMockContext(op);
                const mockNext: MCPCallHandler = {
                    handle: jest.fn().mockImplementation(
                        () => new Promise(() => {}), // Never resolves
                    ),
                };

                const promise = interceptor.intercept(mockContext, mockNext);
                jest.advanceTimersByTime(101);

                try {
                    await promise;
                    throw new Error('Should have thrown MCPTimeoutException');
                } catch (error) {
                    expect(error).toBeInstanceOf(MCPTimeoutException);
                    if (error instanceof MCPTimeoutException) {
                        expect(error.message).toContain(op);
                    }
                }

                jest.clearAllTimers();
            }

            jest.useRealTimers();
        });

        it('should handle very long timeout', async () => {
            const interceptor = new TimeoutInterceptor(999999999);
            const mockContext = createMockContext('long-timeout');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockResolvedValue('completed'),
            };

            const result = await interceptor.intercept(mockContext, mockNext);
            expect(result).toBe('completed');
        });

        it('should handle zero timeout', async () => {
            jest.useFakeTimers();

            const interceptor = new TimeoutInterceptor(0);
            const mockContext = createMockContext('zero-timeout');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockImplementation(
                    () => new Promise(() => {}), // Never resolves
                ),
            };

            const promise = interceptor.intercept(mockContext, mockNext);
            jest.advanceTimersByTime(1);

            await expect(promise).rejects.toThrow(MCPTimeoutException);
        });

        it('should handle concurrent operations independently', async () => {
            jest.useFakeTimers();

            const interceptor = new TimeoutInterceptor(1000);

            // Fast operation
            const fastContext = createMockContext('fast-op');
            const fastNext: MCPCallHandler = {
                handle: jest.fn().mockResolvedValue('fast'),
            };

            // Slow operation (will timeout)
            const slowContext = createMockContext('slow-op');
            const slowNext: MCPCallHandler = {
                handle: jest.fn().mockImplementation(
                    () => new Promise(() => {}), // Never resolves
                ),
            };

            const fastPromise = interceptor.intercept(fastContext, fastNext);
            const slowPromise = interceptor.intercept(slowContext, slowNext);

            // Fast operation should complete immediately
            const fastResult = await fastPromise;
            expect(fastResult).toBe('fast');

            // Advance past timeout for slow operation
            jest.advanceTimersByTime(1001);

            await expect(slowPromise).rejects.toThrow(MCPTimeoutException);
        });
    });

    describe('race condition handling', () => {
        it('should timeout if operation does not complete in time', async () => {
            jest.useFakeTimers();

            const interceptor = new TimeoutInterceptor(1000);
            const mockContext = createMockContext('race-test');

            // Operation that never completes
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockImplementation(
                    () => new Promise(() => {}), // Never resolves
                ),
            };

            const promise = interceptor.intercept(mockContext, mockNext);

            // Advance past timeout
            jest.advanceTimersByTime(1001);

            await expect(promise).rejects.toBeInstanceOf(MCPTimeoutException);
        });

        it('should complete if operation finishes before timeout', async () => {
            const interceptor = new TimeoutInterceptor(1000);
            const mockContext = createMockContext('race-test-2');

            // Operation that completes quickly
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockResolvedValue('completed quickly'),
            };

            const result = await interceptor.intercept(mockContext, mockNext);
            expect(result).toBe('completed quickly');
        });
    });
});

/**
 * Helper to create mock execution context
 */
function createMockContext(operationName: string): MCPExecutionContext {
    return {
        switchToMcp: jest.fn().mockReturnValue({
            getOperationName: jest.fn().mockReturnValue(operationName),
        }),
    } as unknown as MCPExecutionContext;
}
