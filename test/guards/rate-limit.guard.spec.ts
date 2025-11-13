import { RateLimitGuard } from '../../src/guards/rate-limit.guard';
import {
    MCPExecutionContext,
    MCPRateLimitException,
} from '../../src/interfaces';

describe('RateLimitGuard', () => {
    let guard: RateLimitGuard;

    beforeEach(() => {
        guard = new RateLimitGuard();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe('constructor', () => {
        it('should use default config when no config provided', () => {
            const defaultGuard = new RateLimitGuard();
            expect(defaultGuard).toBeDefined();
        });

        it('should use custom config when provided', () => {
            const customGuard = new RateLimitGuard({
                limit: 5,
                window: 30000,
            });
            expect(customGuard).toBeDefined();
        });

        it('should use default values for partial config', () => {
            const partialGuard = new RateLimitGuard({ limit: 20 });
            expect(partialGuard).toBeDefined();
        });
    });

    describe('canActivate', () => {
        it('should allow first request', async () => {
            const mockContext = createMockContext('test-operation');

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(true);
        });

        it('should allow requests within rate limit', async () => {
            const mockContext = createMockContext('test-operation');

            // Make 10 requests (default limit)
            for (let i = 0; i < 10; i++) {
                const result = await guard.canActivate(mockContext);
                expect(result).toBe(true);
            }
        });

        it('should throw MCPRateLimitException when limit exceeded', async () => {
            const customGuard = new RateLimitGuard({
                limit: 3,
                window: 60000,
            });

            const mockContext = createMockContext('test-operation');

            // Make 3 requests (at limit)
            for (let i = 0; i < 3; i++) {
                await customGuard.canActivate(mockContext);
            }

            // 4th request should fail
            await expect(customGuard.canActivate(mockContext)).rejects.toThrow(
                MCPRateLimitException,
            );
            await expect(customGuard.canActivate(mockContext)).rejects.toThrow(
                /Rate limit exceeded for test-operation/,
            );
        });

        it('should include retry information in exception', async () => {
            const customGuard = new RateLimitGuard({
                limit: 1,
                window: 60000,
            });

            const mockContext = createMockContext('test-operation');

            // First request succeeds
            await customGuard.canActivate(mockContext);

            // Second request should fail with retry info
            try {
                await customGuard.canActivate(mockContext);
                throw new Error('Should have thrown MCPRateLimitException');
            } catch (error) {
                expect(error).toBeInstanceOf(MCPRateLimitException);
                if (error instanceof MCPRateLimitException) {
                    expect(error.data).toHaveProperty('retryAfter');
                    expect(error.data).toHaveProperty('limit');
                    expect(error.data?.limit).toBe(1);
                    expect(error.data?.retryAfter).toBeGreaterThan(0);
                }
            }
        });

        it('should reset counter after time window', async () => {
            jest.useFakeTimers();

            const customGuard = new RateLimitGuard({
                limit: 2,
                window: 1000, // 1 second
            });

            const mockContext = createMockContext('test-operation');

            // Use up the limit
            await customGuard.canActivate(mockContext);
            await customGuard.canActivate(mockContext);

            // Should be at limit
            await expect(customGuard.canActivate(mockContext)).rejects.toThrow(
                MCPRateLimitException,
            );

            // Advance time past window
            jest.advanceTimersByTime(1100);

            // Should allow requests again
            const result = await customGuard.canActivate(mockContext);
            expect(result).toBe(true);

            jest.useRealTimers();
        });

        it('should handle multiple operations independently', async () => {
            const customGuard = new RateLimitGuard({
                limit: 2,
                window: 60000,
            });

            const context1 = createMockContext('operation1');
            const context2 = createMockContext('operation2');

            // Use up limit for operation1
            await customGuard.canActivate(context1);
            await customGuard.canActivate(context1);

            // operation1 should be at limit
            await expect(customGuard.canActivate(context1)).rejects.toThrow(
                MCPRateLimitException,
            );

            // operation2 should still work
            await expect(customGuard.canActivate(context2)).resolves.toBe(true);
        });

        it('should clean up expired entries', async () => {
            jest.useFakeTimers();

            const customGuard = new RateLimitGuard({
                limit: 2,
                window: 1000,
            });

            const mockContext = createMockContext('test-operation');

            // Make a request
            await customGuard.canActivate(mockContext);

            // Advance time past window
            jest.advanceTimersByTime(1100);

            // Next request should clean up old entry and start fresh
            await customGuard.canActivate(mockContext);
            await customGuard.canActivate(mockContext);

            // Should be able to make 2 requests in new window
            await expect(customGuard.canActivate(mockContext)).rejects.toThrow(
                MCPRateLimitException,
            );

            jest.useRealTimers();
        });

        it('should handle rapid sequential requests', async () => {
            const customGuard = new RateLimitGuard({
                limit: 5,
                window: 60000,
            });

            const mockContext = createMockContext('rapid-operation');

            // Make 5 rapid requests
            const requests = Array(5)
                .fill(null)
                .map(() => customGuard.canActivate(mockContext));

            const results = await Promise.all(requests);
            expect(results).toHaveLength(5);
            expect(results.every((r) => r === true)).toBe(true);

            // 6th request should fail
            await expect(customGuard.canActivate(mockContext)).rejects.toThrow(
                MCPRateLimitException,
            );
        });
    });

    describe('edge cases', () => {
        it('should handle zero limit', async () => {
            const zeroGuard = new RateLimitGuard({
                limit: 0,
                window: 60000,
            });

            const mockContext = createMockContext('zero-limit');

            // First request should succeed (count starts at 1, not 0)
            await expect(zeroGuard.canActivate(mockContext)).resolves.toBe(
                true,
            );
        });

        it('should handle very short time window', async () => {
            jest.useFakeTimers();

            const shortGuard = new RateLimitGuard({
                limit: 2,
                window: 10, // 10ms
            });

            const mockContext = createMockContext('short-window');

            await shortGuard.canActivate(mockContext);
            await shortGuard.canActivate(mockContext);

            // At limit
            await expect(shortGuard.canActivate(mockContext)).rejects.toThrow(
                MCPRateLimitException,
            );

            // Advance just past window
            jest.advanceTimersByTime(11);

            // Should work again
            await expect(shortGuard.canActivate(mockContext)).resolves.toBe(
                true,
            );

            jest.useRealTimers();
        });

        it('should handle very large limit', async () => {
            const largeGuard = new RateLimitGuard({
                limit: 1000000,
                window: 60000,
            });

            const mockContext = createMockContext('large-limit');

            // Should handle large number of requests
            for (let i = 0; i < 100; i++) {
                await expect(largeGuard.canActivate(mockContext)).resolves.toBe(
                    true,
                );
            }
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
