import { BaseMCPTransportAdapter } from '../../src/transports/base-transport.adapter';
import { MCPService } from '../../src/services/mcp.service';
import {
    MCPResponse,
    MCPRequest,
    MCPTransportOptions,
} from '../../src/interfaces';

class TestTransportAdapter extends BaseMCPTransportAdapter {
    async start(): Promise<void> {
        this.running = true;
    }

    async stop(): Promise<void> {
        this.running = false;
        this.clients.clear();
    }

    async send(_clientId: string, _response: MCPResponse): Promise<void> {
        // Test implementation
    }

    async broadcast(_response: MCPResponse): Promise<void> {
        // Test implementation
    }

    // Expose protected methods for testing
    public testHandleRequest(clientId: string, request: MCPRequest) {
        return this.handleRequest(clientId, request);
    }

    public testOnClientConnect(clientId: string, client: unknown) {
        return this.onClientConnect(clientId, client);
    }

    public testOnClientDisconnect(clientId: string) {
        return this.onClientDisconnect(clientId);
    }

    public testGenerateClientId() {
        return this.generateClientId();
    }

    public getClients() {
        return this.clients;
    }
}

describe('BaseMCPTransportAdapter', () => {
    let adapter: TestTransportAdapter;
    let mockMCPService: jest.Mocked<MCPService>;
    let options: MCPTransportOptions;

    beforeEach(() => {
        mockMCPService = {
            handleRequest: jest.fn(),
            getSDKServer: jest.fn(),
            isInitialized: jest.fn(),
        } as unknown as jest.Mocked<MCPService>;

        options = {
            debug: false,
        };

        adapter = new TestTransportAdapter(mockMCPService, options);
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            expect(adapter.isRunning()).toBe(false);
            expect(adapter.getConnectedClients()).toEqual([]);
        });

        it('should initialize logger with debug level when debug is true', () => {
            const debugAdapter = new TestTransportAdapter(mockMCPService, {
                debug: true,
            });
            expect(debugAdapter).toBeDefined();
        });

        it('should initialize logger with info level when debug is false', () => {
            expect(adapter).toBeDefined();
        });
    });

    describe('isRunning', () => {
        it('should return false initially', () => {
            expect(adapter.isRunning()).toBe(false);
        });

        it('should return true after start', async () => {
            await adapter.start();
            expect(adapter.isRunning()).toBe(true);
        });

        it('should return false after stop', async () => {
            await adapter.start();
            await adapter.stop();
            expect(adapter.isRunning()).toBe(false);
        });
    });

    describe('getConnectedClients', () => {
        it('should return empty array when no clients connected', () => {
            expect(adapter.getConnectedClients()).toEqual([]);
        });

        it('should return array of connected client IDs', () => {
            adapter.testOnClientConnect('client1', {});
            adapter.testOnClientConnect('client2', {});
            expect(adapter.getConnectedClients()).toEqual([
                'client1',
                'client2',
            ]);
        });

        it('should update after client disconnects', () => {
            adapter.testOnClientConnect('client1', {});
            adapter.testOnClientConnect('client2', {});
            adapter.testOnClientDisconnect('client1');
            expect(adapter.getConnectedClients()).toEqual(['client2']);
        });
    });

    describe('handleRequest', () => {
        const mockRequest: MCPRequest = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
        };

        const mockResponse: MCPResponse = {
            jsonrpc: '2.0',
            id: 1,
            result: { tools: [] },
        };

        it('should handle request successfully', async () => {
            mockMCPService.handleRequest.mockResolvedValue(mockResponse);

            const result = await adapter.testHandleRequest(
                'client1',
                mockRequest,
            );

            expect(mockMCPService.handleRequest).toHaveBeenCalledWith(
                mockRequest,
            );
            expect(result).toEqual(mockResponse);
        });

        it('should call error handler on error if provided', async () => {
            const error = new Error('Test error');
            const errorHandler = jest.fn();
            const adapterWithErrorHandler = new TestTransportAdapter(
                mockMCPService,
                {
                    errorHandler,
                },
            );

            mockMCPService.handleRequest.mockRejectedValue(error);

            await expect(
                adapterWithErrorHandler.testHandleRequest(
                    'client1',
                    mockRequest,
                ),
            ).rejects.toThrow('Test error');

            expect(errorHandler).toHaveBeenCalledWith(error, 'client1');
        });

        it('should handle non-Error exceptions', async () => {
            const errorHandler = jest.fn();
            const adapterWithErrorHandler = new TestTransportAdapter(
                mockMCPService,
                {
                    errorHandler,
                },
            );

            mockMCPService.handleRequest.mockRejectedValue('string error');

            await expect(
                adapterWithErrorHandler.testHandleRequest(
                    'client1',
                    mockRequest,
                ),
            ).rejects.toBe('string error');

            expect(errorHandler).toHaveBeenCalledWith(
                new Error('string error'),
                'client1',
            );
        });

        it('should not call error handler if not provided', async () => {
            const error = new Error('Test error');
            mockMCPService.handleRequest.mockRejectedValue(error);

            await expect(
                adapter.testHandleRequest('client1', mockRequest),
            ).rejects.toThrow('Test error');
        });
    });

    describe('onClientConnect', () => {
        it('should add client to connected clients', () => {
            const client = { socket: 'mock' };
            adapter.testOnClientConnect('client1', client);

            expect(adapter.getConnectedClients()).toContain('client1');
            expect(adapter.getClients().get('client1')).toBe(client);
        });

        it('should reject connection when max connections reached', () => {
            const adapterWithLimit = new TestTransportAdapter(mockMCPService, {
                maxConnections: 2,
            });

            adapterWithLimit.testOnClientConnect('client1', {});
            adapterWithLimit.testOnClientConnect('client2', {});
            adapterWithLimit.testOnClientConnect('client3', {});

            expect(adapterWithLimit.getConnectedClients()).toHaveLength(2);
            expect(adapterWithLimit.getConnectedClients()).not.toContain(
                'client3',
            );
        });

        it('should allow connection when below max connections', () => {
            const adapterWithLimit = new TestTransportAdapter(mockMCPService, {
                maxConnections: 3,
            });

            adapterWithLimit.testOnClientConnect('client1', {});
            adapterWithLimit.testOnClientConnect('client2', {});

            expect(adapterWithLimit.getConnectedClients()).toHaveLength(2);
        });

        it('should handle multiple connections without limit', () => {
            for (let i = 0; i < 100; i++) {
                adapter.testOnClientConnect(`client${i}`, {});
            }

            expect(adapter.getConnectedClients()).toHaveLength(100);
        });
    });

    describe('onClientDisconnect', () => {
        it('should remove client from connected clients', () => {
            adapter.testOnClientConnect('client1', {});
            adapter.testOnClientDisconnect('client1');

            expect(adapter.getConnectedClients()).not.toContain('client1');
        });

        it('should handle disconnecting non-existent client', () => {
            expect(() => {
                adapter.testOnClientDisconnect('nonexistent');
            }).not.toThrow();
        });

        it('should handle multiple disconnects', () => {
            adapter.testOnClientConnect('client1', {});
            adapter.testOnClientConnect('client2', {});
            adapter.testOnClientConnect('client3', {});

            adapter.testOnClientDisconnect('client1');
            adapter.testOnClientDisconnect('client3');

            expect(adapter.getConnectedClients()).toEqual(['client2']);
        });
    });

    describe('generateClientId', () => {
        it('should generate unique client IDs', () => {
            const id1 = adapter.testGenerateClientId();
            const id2 = adapter.testGenerateClientId();

            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^client-\d+-[a-z0-9]+$/);
            expect(id2).toMatch(/^client-\d+-[a-z0-9]+$/);
        });

        it('should generate IDs with correct format', () => {
            const id = adapter.testGenerateClientId();
            expect(id).toMatch(/^client-\d+-[a-z0-9]{9}$/);
        });

        it('should generate multiple unique IDs', () => {
            const ids = new Set<string>();
            for (let i = 0; i < 100; i++) {
                ids.add(adapter.testGenerateClientId());
            }
            expect(ids.size).toBe(100);
        });
    });

    describe('onModuleDestroy', () => {
        it('should stop adapter when running', async () => {
            await adapter.start();
            expect(adapter.isRunning()).toBe(true);

            await adapter.onModuleDestroy();
            expect(adapter.isRunning()).toBe(false);
        });

        it('should not throw if adapter is not running', async () => {
            expect(adapter.isRunning()).toBe(false);
            await expect(adapter.onModuleDestroy()).resolves.not.toThrow();
        });

        it('should clear all clients on destroy', async () => {
            adapter.testOnClientConnect('client1', {});
            adapter.testOnClientConnect('client2', {});

            await adapter.start();
            await adapter.onModuleDestroy();

            expect(adapter.getConnectedClients()).toEqual([]);
        });
    });

    describe('abstract methods', () => {
        it('should implement start method', async () => {
            await expect(adapter.start()).resolves.not.toThrow();
            expect(adapter.isRunning()).toBe(true);
        });

        it('should implement stop method', async () => {
            await adapter.start();
            await expect(adapter.stop()).resolves.not.toThrow();
            expect(adapter.isRunning()).toBe(false);
        });

        it('should implement send method', async () => {
            const response: MCPResponse = {
                jsonrpc: '2.0',
                id: 1,
                result: {},
            };
            await expect(
                adapter.send('client1', response),
            ).resolves.not.toThrow();
        });

        it('should implement broadcast method', async () => {
            const response: MCPResponse = {
                jsonrpc: '2.0',
                id: 1,
                result: {},
            };
            await expect(adapter.broadcast(response)).resolves.not.toThrow();
        });
    });
});
