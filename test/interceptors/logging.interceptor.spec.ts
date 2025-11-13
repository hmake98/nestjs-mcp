import { LoggingInterceptor } from '../../src/interceptors/logging.interceptor';
import { MCPExecutionContext, MCPCallHandler } from '../../src/interfaces';
import { MCPLogger, LogLevel } from '../../src/utils';

// Mock MCPLogger
jest.mock('../../src/utils', () => {
    const actual = jest.requireActual('../../src/utils');
    return {
        ...actual,
        MCPLogger: jest.fn().mockImplementation(() => ({
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
        })),
    };
});

describe('LoggingInterceptor', () => {
    let interceptor: LoggingInterceptor;
    let mockLogger: jest.Mocked<MCPLogger>;

    beforeEach(() => {
        jest.clearAllMocks();
        interceptor = new LoggingInterceptor();
        // Get the mocked logger instance
        mockLogger = (MCPLogger as jest.MockedClass<typeof MCPLogger>).mock
            .results[0].value as jest.Mocked<MCPLogger>;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('constructor', () => {
        it('should create logger with default log level', () => {
            new LoggingInterceptor();
            expect(MCPLogger).toHaveBeenCalledWith(
                LoggingInterceptor.name,
                LogLevel.INFO,
            );
        });

        it('should create logger with custom log level', () => {
            new LoggingInterceptor(LogLevel.DEBUG);
            expect(MCPLogger).toHaveBeenCalledWith(
                LoggingInterceptor.name,
                LogLevel.DEBUG,
            );
        });
    });

    describe('intercept', () => {
        it('should log start and completion of successful operation', async () => {
            const mockContext = createMockContext('test-tool', 'tool');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockResolvedValue({ result: 'success' }),
            };

            const result = await interceptor.intercept(mockContext, mockNext);

            expect(result).toEqual({ result: 'success' });
            expect(mockLogger.log).toHaveBeenCalledWith(
                '[tool] test-tool - Start',
            );
            expect(mockLogger.log).toHaveBeenCalledWith(
                expect.stringMatching(
                    /\[tool\] test-tool - Complete \(\d+ms\)/,
                ),
            );
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it('should log errors when operation fails', async () => {
            const mockContext = createMockContext('failing-tool', 'tool');
            const error = new Error('Operation failed');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(error),
            };

            await expect(
                interceptor.intercept(mockContext, mockNext),
            ).rejects.toThrow('Operation failed');

            expect(mockLogger.log).toHaveBeenCalledWith(
                '[tool] failing-tool - Start',
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringMatching(
                    /\[tool\] failing-tool - Error \(\d+ms\): Operation failed/,
                ),
            );
        });

        it('should handle non-Error exceptions', async () => {
            const mockContext = createMockContext('error-tool', 'tool');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue('string error'),
            };

            await expect(
                interceptor.intercept(mockContext, mockNext),
            ).rejects.toBe('string error');

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringMatching(
                    /\[tool\] error-tool - Error \(\d+ms\): string error/,
                ),
            );
        });

        it('should log different operation types correctly', async () => {
            const contexts = [
                createMockContext('my-tool', 'tool'),
                createMockContext('my-resource', 'resource'),
                createMockContext('my-prompt', 'prompt'),
            ];

            for (const context of contexts) {
                const type = context.switchToMcp().getType();
                const name = context.switchToMcp().getOperationName();

                const mockNext: MCPCallHandler = {
                    handle: jest.fn().mockResolvedValue({}),
                };

                await interceptor.intercept(context, mockNext);

                expect(mockLogger.log).toHaveBeenCalledWith(
                    `[${type}] ${name} - Start`,
                );
                expect(mockLogger.log).toHaveBeenCalledWith(
                    expect.stringMatching(
                        new RegExp(
                            `\\[${type}\\] ${name} - Complete \\(\\d+ms\\)`,
                        ),
                    ),
                );
            }
        });

        it('should measure execution time', async () => {
            jest.useFakeTimers();
            const mockContext = createMockContext('slow-tool', 'tool');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockImplementation(async () => {
                    jest.advanceTimersByTime(150);
                    return { done: true };
                }),
            };

            const promise = interceptor.intercept(mockContext, mockNext);
            await jest.runAllTimersAsync();
            await promise;

            expect(mockLogger.log).toHaveBeenCalledWith(
                expect.stringContaining('[tool] slow-tool - Complete ('),
            );
        });

        it('should measure execution time for failed operations', async () => {
            const mockContext = createMockContext('failing-tool', 'tool');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(new Error('Failure')),
            };

            await expect(
                interceptor.intercept(mockContext, mockNext),
            ).rejects.toThrow('Failure');

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringMatching(
                    /\[tool\] failing-tool - Error \(\d+ms\): Failure/,
                ),
            );
        });

        it('should re-throw caught errors', async () => {
            const mockContext = createMockContext('error-tool', 'tool');
            const customError = new Error('Custom error');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(customError),
            };

            await expect(
                interceptor.intercept(mockContext, mockNext),
            ).rejects.toThrow(customError);
        });

        it('should handle undefined/null errors', async () => {
            const mockContext = createMockContext('null-error-tool', 'tool');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(null),
            };

            await expect(
                interceptor.intercept(mockContext, mockNext),
            ).rejects.toBeNull();

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringMatching(
                    /\[tool\] null-error-tool - Error \(\d+ms\): null/,
                ),
            );
        });

        it('should handle object errors', async () => {
            const mockContext = createMockContext('object-error-tool', 'tool');
            const objectError = { code: 500, message: 'Server error' };
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(objectError),
            };

            await expect(
                interceptor.intercept(mockContext, mockNext),
            ).rejects.toBe(objectError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringMatching(
                    /\[tool\] object-error-tool - Error \(\d+ms\):/,
                ),
            );
        });
    });

    describe('integration with different log levels', () => {
        it('should use verbose log level when specified', () => {
            new LoggingInterceptor(LogLevel.VERBOSE);
            expect(MCPLogger).toHaveBeenCalledWith(
                LoggingInterceptor.name,
                LogLevel.VERBOSE,
            );
        });

        it('should use error log level when specified', () => {
            new LoggingInterceptor(LogLevel.ERROR);
            expect(MCPLogger).toHaveBeenCalledWith(
                LoggingInterceptor.name,
                LogLevel.ERROR,
            );
        });
    });
});

/**
 * Helper to create mock execution context
 */
function createMockContext(
    operationName: string,
    type: string,
): MCPExecutionContext {
    return {
        switchToMcp: jest.fn().mockReturnValue({
            getOperationName: jest.fn().mockReturnValue(operationName),
            getType: jest.fn().mockReturnValue(type),
        }),
    } as unknown as MCPExecutionContext;
}
