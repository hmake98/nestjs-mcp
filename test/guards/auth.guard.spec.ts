import { AuthGuard } from '../../src/guards/auth.guard';
import {
    MCPExecutionContext,
    MCPUnauthorizedException,
} from '../../src/interfaces';

describe('AuthGuard', () => {
    let guard: AuthGuard;

    beforeEach(() => {
        guard = new AuthGuard();
    });

    describe('canActivate', () => {
        it('should allow access with valid API key', async () => {
            const mockContext = {
                getRequest: jest.fn().mockReturnValue({
                    params: { auth: 'valid-api-key' },
                }),
            } as unknown as MCPExecutionContext;

            const result = await guard.canActivate(mockContext);

            expect(result).toBe(true);
            expect(mockContext.getRequest).toHaveBeenCalled();
        });

        it('should throw MCPUnauthorizedException when API key is missing', async () => {
            const mockContext = {
                getRequest: jest.fn().mockReturnValue({
                    params: {},
                }),
            } as unknown as MCPExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                MCPUnauthorizedException,
            );
            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                'Authentication required. Provide a valid API key.',
            );
        });

        it('should throw MCPUnauthorizedException when API key is not a string', async () => {
            const mockContext = {
                getRequest: jest.fn().mockReturnValue({
                    params: { auth: 12345 },
                }),
            } as unknown as MCPExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                MCPUnauthorizedException,
            );
        });

        it('should throw MCPUnauthorizedException when API key is invalid', async () => {
            // Create a subclass that invalidates all keys
            class StrictAuthGuard extends AuthGuard {
                protected validateApiKey(_apiKey: string): boolean {
                    return false;
                }
            }

            const strictGuard = new StrictAuthGuard();
            const mockContext = {
                getRequest: jest.fn().mockReturnValue({
                    params: { auth: 'some-key' },
                }),
            } as unknown as MCPExecutionContext;

            await expect(strictGuard.canActivate(mockContext)).rejects.toThrow(
                MCPUnauthorizedException,
            );
            await expect(strictGuard.canActivate(mockContext)).rejects.toThrow(
                'Invalid API key',
            );
        });

        it('should handle request without params', async () => {
            const mockContext = {
                getRequest: jest.fn().mockReturnValue({}),
            } as unknown as MCPExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                MCPUnauthorizedException,
            );
        });

        it('should handle empty API key', async () => {
            const mockContext = {
                getRequest: jest.fn().mockReturnValue({
                    params: { auth: '' },
                }),
            } as unknown as MCPExecutionContext;

            await expect(guard.canActivate(mockContext)).rejects.toThrow(
                MCPUnauthorizedException,
            );
        });
    });

    describe('validateApiKey', () => {
        it('should validate non-empty strings', () => {
            // Access protected method through type assertion
            const result = (
                guard as unknown as { validateApiKey: (key: string) => boolean }
            ).validateApiKey('test-key');
            expect(result).toBe(true);
        });

        it('should reject empty strings', () => {
            const result = (
                guard as unknown as { validateApiKey: (key: string) => boolean }
            ).validateApiKey('');
            expect(result).toBe(false);
        });
    });

    describe('Custom AuthGuard', () => {
        it('should allow custom validation logic', async () => {
            const validKeys = ['key1', 'key2', 'key3'];

            class CustomAuthGuard extends AuthGuard {
                protected validateApiKey(apiKey: string): boolean {
                    return validKeys.includes(apiKey);
                }
            }

            const customGuard = new CustomAuthGuard();

            const validContext = {
                getRequest: jest.fn().mockReturnValue({
                    params: { auth: 'key1' },
                }),
            } as unknown as MCPExecutionContext;

            const invalidContext = {
                getRequest: jest.fn().mockReturnValue({
                    params: { auth: 'invalid-key' },
                }),
            } as unknown as MCPExecutionContext;

            await expect(customGuard.canActivate(validContext)).resolves.toBe(
                true,
            );
            await expect(
                customGuard.canActivate(invalidContext),
            ).rejects.toThrow('Invalid API key');
        });
    });
});
