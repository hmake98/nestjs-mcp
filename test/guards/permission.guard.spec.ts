import { PermissionGuard } from '../../src/guards/permission.guard';
import {
    MCPExecutionContext,
    MCPForbiddenException,
} from '../../src/interfaces';

describe('PermissionGuard', () => {
    let guard: PermissionGuard;

    beforeEach(() => {
        guard = new PermissionGuard();
    });

    describe('canActivate', () => {
        it('should allow access when no permission is required', async () => {
            const mockContext = {
                getMetadata: jest.fn().mockReturnValue(undefined),
                getRequest: jest.fn().mockReturnValue({
                    params: {},
                }),
            } as unknown as MCPExecutionContext;

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(true);
            expect(mockContext.getMetadata).toHaveBeenCalledWith('permission');
        });

        it('should allow access when user has required permission', async () => {
            const mockContext = {
                getMetadata: jest.fn().mockReturnValue('read'),
                getRequest: jest.fn().mockReturnValue({
                    params: { permissions: ['read', 'write'] },
                }),
            } as unknown as MCPExecutionContext;

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(true);
        });

        it('should check role metadata if permission metadata is not found', async () => {
            const mockContext = {
                getMetadata: jest
                    .fn()
                    .mockReturnValueOnce(undefined) // permission
                    .mockReturnValueOnce('admin'), // role
                getRequest: jest.fn().mockReturnValue({
                    params: { permissions: ['admin', 'user'] },
                }),
            } as unknown as MCPExecutionContext;

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(true);
            expect(mockContext.getMetadata).toHaveBeenCalledWith('permission');
            expect(mockContext.getMetadata).toHaveBeenCalledWith('role');
        });

        it('should throw MCPForbiddenException when user lacks required permission', async () => {
            const mockContext = {
                getMetadata: jest.fn().mockReturnValue('admin'),
                getRequest: jest.fn().mockReturnValue({
                    params: { permissions: ['read', 'write'] },
                }),
            } as unknown as MCPExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                MCPForbiddenException,
            );
            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                'Insufficient permissions. Required: admin',
            );
        });

        it('should throw MCPForbiddenException when user has no permissions', async () => {
            const mockContext = {
                getMetadata: jest.fn().mockReturnValue('read'),
                getRequest: jest.fn().mockReturnValue({
                    params: {},
                }),
            } as unknown as MCPExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                MCPForbiddenException,
            );
        });

        it('should handle non-array permissions gracefully', async () => {
            const mockContext = {
                getMetadata: jest.fn().mockReturnValue('admin'),
                getRequest: jest.fn().mockReturnValue({
                    params: { permissions: 'not-an-array' },
                }),
            } as unknown as MCPExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                MCPForbiddenException,
            );
        });

        it('should handle request without params', async () => {
            const mockContext = {
                getMetadata: jest.fn().mockReturnValue('admin'),
                getRequest: jest.fn().mockReturnValue({}),
            } as unknown as MCPExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                MCPForbiddenException,
            );
        });

        it('should include permission details in exception', async () => {
            const mockContext = {
                getMetadata: jest.fn().mockReturnValue('admin'),
                getRequest: jest.fn().mockReturnValue({
                    params: { permissions: ['user'] },
                }),
            } as unknown as MCPExecutionContext;

            try {
                await guard.canActivate(mockContext);
                throw new Error('Should have thrown MCPForbiddenException');
            } catch (error) {
                expect(error).toBeInstanceOf(MCPForbiddenException);
                if (error instanceof MCPForbiddenException) {
                    expect(error.data).toEqual({
                        required: 'admin',
                        provided: ['user'],
                    });
                }
            }
        });
    });

    describe('extractPermissions', () => {
        it('should extract permissions from request params', () => {
            const request = {
                params: { permissions: ['read', 'write', 'delete'] },
            };
            const permissions = (
                guard as unknown as {
                    extractPermissions: (
                        req: Record<string, unknown>,
                    ) => string[];
                }
            ).extractPermissions(request);
            expect(permissions).toEqual(['read', 'write', 'delete']);
        });

        it('should return empty array when permissions are not an array', () => {
            const request = {
                params: { permissions: 'not-an-array' },
            };
            const permissions = (
                guard as unknown as {
                    extractPermissions: (
                        req: Record<string, unknown>,
                    ) => string[];
                }
            ).extractPermissions(request);
            expect(permissions).toEqual([]);
        });

        it('should return empty array when params are missing', () => {
            const request = {};
            const permissions = (
                guard as unknown as {
                    extractPermissions: (
                        req: Record<string, unknown>,
                    ) => string[];
                }
            ).extractPermissions(request);
            expect(permissions).toEqual([]);
        });
    });

    describe('Custom PermissionGuard', () => {
        it('should allow custom permission extraction logic', async () => {
            class CustomPermissionGuard extends PermissionGuard {
                protected extractPermissions(
                    request: Record<string, unknown>,
                ): string[] {
                    // Extract from custom location
                    const user = request.user as Record<string, unknown>;
                    return (user?.roles as string[]) || [];
                }
            }

            const customGuard = new CustomPermissionGuard();

            const validContext = {
                getMetadata: jest.fn().mockReturnValue('admin'),
                getRequest: jest.fn().mockReturnValue({
                    user: { roles: ['admin', 'user'] },
                }),
            } as unknown as MCPExecutionContext;

            const invalidContext = {
                getMetadata: jest.fn().mockReturnValue('admin'),
                getRequest: jest.fn().mockReturnValue({
                    user: { roles: ['user'] },
                }),
            } as unknown as MCPExecutionContext;

            await expect(customGuard.canActivate(validContext)).resolves.toBe(
                true,
            );
            await expect(
                customGuard.canActivate(invalidContext),
            ).rejects.toThrow(MCPForbiddenException);
        });
    });
});
