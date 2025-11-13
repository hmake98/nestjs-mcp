import { ErrorMappingInterceptor } from '../../src/interceptors/error-mapping.interceptor';
import {
    MCPExecutionContext,
    MCPCallHandler,
    MCPException,
} from '../../src/interfaces';
import { MCPErrorCode } from '../../src/constants';

describe('ErrorMappingInterceptor', () => {
    let interceptor: ErrorMappingInterceptor;

    beforeEach(() => {
        interceptor = new ErrorMappingInterceptor();
    });

    describe('intercept', () => {
        it('should pass through successful result', async () => {
            const mockContext = {} as MCPExecutionContext;
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockResolvedValue({ success: true }),
            };

            const result = await interceptor.intercept(mockContext, mockNext);

            expect(result).toEqual({ success: true });
            expect(mockNext.handle).toHaveBeenCalled();
        });

        it('should pass through MCPException without modification', async () => {
            const mockContext = {} as MCPExecutionContext;
            const mcpError = new MCPException(
                MCPErrorCode.INVALID_PARAMS,
                'Already an MCP error',
            );
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(mcpError),
            };

            await expect(
                interceptor.intercept(mockContext, mockNext),
            ).rejects.toThrow(mcpError);
            await expect(
                interceptor.intercept(mockContext, mockNext),
            ).rejects.toThrow(MCPException);
        });

        it('should map "not found" errors to METHOD_NOT_FOUND', async () => {
            const mockContext = {} as MCPExecutionContext;
            const error = new Error('Resource not found');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(error),
            };

            try {
                await interceptor.intercept(mockContext, mockNext);
                throw new Error('Should have thrown MCPException');
            } catch (err) {
                expect(err).toBeInstanceOf(MCPException);
                if (err instanceof MCPException) {
                    expect(err.code).toBe(MCPErrorCode.METHOD_NOT_FOUND);
                    expect(err.message).toBe('Resource not found');
                }
            }
        });

        it('should map "invalid" errors to INVALID_PARAMS', async () => {
            const mockContext = {} as MCPExecutionContext;
            const error = new Error('invalid parameter provided');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(error),
            };

            try {
                await interceptor.intercept(mockContext, mockNext);
                throw new Error('Should have thrown MCPException');
            } catch (err) {
                expect(err).toBeInstanceOf(MCPException);
                if (err instanceof MCPException) {
                    expect(err.code).toBe(MCPErrorCode.INVALID_PARAMS);
                    expect(err.message).toBe('invalid parameter provided');
                }
            }
        });

        it('should map "validation" errors to INVALID_PARAMS', async () => {
            const mockContext = {} as MCPExecutionContext;
            const error = new Error('validation failed');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(error),
            };

            try {
                await interceptor.intercept(mockContext, mockNext);
                throw new Error('Should have thrown MCPException');
            } catch (err) {
                expect(err).toBeInstanceOf(MCPException);
                if (err instanceof MCPException) {
                    expect(err.code).toBe(MCPErrorCode.INVALID_PARAMS);
                }
            }
        });

        it('should map "permission" errors to error code -32001', async () => {
            const mockContext = {} as MCPExecutionContext;
            const error = new Error('permission denied');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(error),
            };

            try {
                await interceptor.intercept(mockContext, mockNext);
                throw new Error('Should have thrown MCPException');
            } catch (err) {
                expect(err).toBeInstanceOf(MCPException);
                if (err instanceof MCPException) {
                    expect(err.code).toBe(-32001);
                    expect(err.message).toBe('permission denied');
                }
            }
        });

        it('should map "unauthorized" errors to error code -32001', async () => {
            const mockContext = {} as MCPExecutionContext;
            const error = new Error('unauthorized access');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(error),
            };

            try {
                await interceptor.intercept(mockContext, mockNext);
                throw new Error('Should have thrown MCPException');
            } catch (err) {
                expect(err).toBeInstanceOf(MCPException);
                if (err instanceof MCPException) {
                    expect(err.code).toBe(-32001);
                }
            }
        });

        it('should map generic errors to INTERNAL_ERROR', async () => {
            const mockContext = {} as MCPExecutionContext;
            const error = new Error('Something went wrong');
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(error),
            };

            try {
                await interceptor.intercept(mockContext, mockNext);
                throw new Error('Should have thrown MCPException');
            } catch (err) {
                expect(err).toBeInstanceOf(MCPException);
                if (err instanceof MCPException) {
                    expect(err.code).toBe(MCPErrorCode.INTERNAL_ERROR);
                    expect(err.message).toBe('Something went wrong');
                }
            }
        });

        it('should map non-Error objects to INTERNAL_ERROR', async () => {
            const mockContext = {} as MCPExecutionContext;
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue('string error'),
            };

            try {
                await interceptor.intercept(mockContext, mockNext);
                throw new Error('Should have thrown MCPException');
            } catch (err) {
                expect(err).toBeInstanceOf(MCPException);
                if (err instanceof MCPException) {
                    expect(err.code).toBe(MCPErrorCode.INTERNAL_ERROR);
                    expect(err.message).toBe('An unknown error occurred');
                }
            }
        });

        it('should map null/undefined errors to INTERNAL_ERROR', async () => {
            const mockContext = {} as MCPExecutionContext;
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(null),
            };

            try {
                await interceptor.intercept(mockContext, mockNext);
                throw new Error('Should have thrown MCPException');
            } catch (err) {
                expect(err).toBeInstanceOf(MCPException);
                if (err instanceof MCPException) {
                    expect(err.code).toBe(MCPErrorCode.INTERNAL_ERROR);
                }
            }
        });
    });

    describe('mapError', () => {
        it('should be extensible through inheritance', async () => {
            class CustomErrorMapper extends ErrorMappingInterceptor {
                protected mapError(error: unknown): MCPException {
                    if (
                        error instanceof Error &&
                        error.message.includes('custom')
                    ) {
                        return new MCPException(-99999, 'Custom error mapped');
                    }
                    return super.mapError(error);
                }
            }

            const customMapper = new CustomErrorMapper();
            const mockContext = {} as MCPExecutionContext;
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(new Error('custom error')),
            };

            try {
                await customMapper.intercept(mockContext, mockNext);
                throw new Error('Should have thrown MCPException');
            } catch (err) {
                expect(err).toBeInstanceOf(MCPException);
                if (err instanceof MCPException) {
                    expect(err.code).toBe(-99999);
                    expect(err.message).toBe('Custom error mapped');
                }
            }
        });
    });

    describe('error message matching', () => {
        it('should be case-sensitive for keyword matching', async () => {
            const mockContext = {} as MCPExecutionContext;
            const error = new Error('NOT FOUND'); // uppercase
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(error),
            };

            try {
                await interceptor.intercept(mockContext, mockNext);
                throw new Error('Should have thrown MCPException');
            } catch (err) {
                expect(err).toBeInstanceOf(MCPException);
                if (err instanceof MCPException) {
                    // Should not match "not found" pattern due to case
                    expect(err.code).toBe(MCPErrorCode.INTERNAL_ERROR);
                }
            }
        });

        it('should handle errors with multiple keywords', async () => {
            const mockContext = {} as MCPExecutionContext;
            const error = new Error('invalid not found'); // Has both keywords
            const mockNext: MCPCallHandler = {
                handle: jest.fn().mockRejectedValue(error),
            };

            try {
                await interceptor.intercept(mockContext, mockNext);
                throw new Error('Should have thrown MCPException');
            } catch (err) {
                expect(err).toBeInstanceOf(MCPException);
                if (err instanceof MCPException) {
                    // Should match first pattern checked (not found)
                    expect(err.code).toBe(MCPErrorCode.METHOD_NOT_FOUND);
                }
            }
        });
    });
});
