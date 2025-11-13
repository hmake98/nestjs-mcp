import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MCPController } from '../../src/controllers/mcp.controller';
import { MCPService } from '../../src/services/mcp.service';
import { MCPRegistryService } from '../../src/services/mcp-registry.service';
import { MCPRequest, MCPModuleOptions } from '../../src/interfaces';
import { MCP_MODULE_OPTIONS, MCPMethod } from '../../src/constants';

describe('MCPController', () => {
    let controller: MCPController;
    let service: MCPService;
    const mockOptions: MCPModuleOptions = {
        serverInfo: {
            name: 'Test Server',
            version: '1.0.0',
            capabilities: {
                tools: {},
                resources: {},
                prompts: {},
            },
        },
        enableLogging: true,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MCPController],
            providers: [
                MCPService,
                MCPRegistryService,
                {
                    provide: MCP_MODULE_OPTIONS,
                    useValue: mockOptions,
                },
            ],
        }).compile();

        controller = module.get<MCPController>(MCPController);
        service = module.get<MCPService>(MCPService);
        jest.spyOn(Logger.prototype, 'log').mockImplementation();
        jest.spyOn(Logger.prototype, 'debug').mockImplementation();
        jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handleRequest', () => {
        it('should handle a single request', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.PING,
            };

            const response = await controller.handleRequest(request);

            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(1);
            expect(response.result).toEqual({});
        });

        it('should log request when logging is enabled', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 2,
                method: MCPMethod.PING,
            };

            await controller.handleRequest(request);

            expect(Logger.prototype.debug).toHaveBeenCalledWith(
                expect.stringContaining('Received request'),
            );
            expect(Logger.prototype.debug).toHaveBeenCalledWith(
                expect.stringContaining('Sending response'),
            );
        });

        it('should handle initialize request', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 3,
                method: MCPMethod.INITIALIZE,
                params: {},
            };

            const response = await controller.handleRequest(request);

            expect(response.result).toHaveProperty('protocolVersion');
            expect(response.result).toHaveProperty('capabilities');
        });

        it('should delegate to MCPService', async () => {
            const handleSpy = jest.spyOn(service, 'handleRequest');
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 4,
                method: MCPMethod.PING,
            };

            await controller.handleRequest(request);

            expect(handleSpy).toHaveBeenCalledWith(request);
        });
    });

    describe('handleBatchRequest', () => {
        it('should handle multiple requests', async () => {
            const requests: MCPRequest[] = [
                {
                    jsonrpc: '2.0',
                    id: 1,
                    method: MCPMethod.PING,
                },
                {
                    jsonrpc: '2.0',
                    id: 2,
                    method: MCPMethod.TOOLS_LIST,
                },
            ];

            const responses = await controller.handleBatchRequest(requests);

            expect(responses).toHaveLength(2);
            expect(responses[0].id).toBe(1);
            expect(responses[1].id).toBe(2);
        });

        it('should throw error for non-array input', async () => {
            const invalidInput = { not: 'array' } as unknown as MCPRequest[];

            await expect(
                controller.handleBatchRequest(invalidInput),
            ).rejects.toThrow('Batch request must be an array');
        });

        it('should log batch request when logging is enabled', async () => {
            const requests: MCPRequest[] = [
                {
                    jsonrpc: '2.0',
                    id: 1,
                    method: MCPMethod.PING,
                },
            ];

            await controller.handleBatchRequest(requests);

            expect(Logger.prototype.debug).toHaveBeenCalledWith(
                expect.stringContaining('Received batch request'),
            );
        });

        it('should process all requests in parallel', async () => {
            const requests: MCPRequest[] = [
                {
                    jsonrpc: '2.0',
                    id: 1,
                    method: MCPMethod.PING,
                },
                {
                    jsonrpc: '2.0',
                    id: 2,
                    method: MCPMethod.PING,
                },
                {
                    jsonrpc: '2.0',
                    id: 3,
                    method: MCPMethod.PING,
                },
            ];

            const responses = await controller.handleBatchRequest(requests);

            expect(responses).toHaveLength(3);
            responses.forEach((response, index) => {
                expect(response.id).toBe(index + 1);
                expect(response.result).toEqual({});
            });
        });
    });

    describe('logging disabled', () => {
        beforeEach(async () => {
            const moduleWithoutLogging: TestingModule =
                await Test.createTestingModule({
                    controllers: [MCPController],
                    providers: [
                        MCPService,
                        MCPRegistryService,
                        {
                            provide: MCP_MODULE_OPTIONS,
                            useValue: {
                                ...mockOptions,
                                enableLogging: false,
                            },
                        },
                    ],
                }).compile();

            controller = moduleWithoutLogging.get<MCPController>(MCPController);
            jest.clearAllMocks();
        });

        it('should not log when logging is disabled', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.PING,
            };

            await controller.handleRequest(request);

            expect(Logger.prototype.debug).not.toHaveBeenCalled();
        });

        it('should not log batch requests when logging is disabled', async () => {
            const requests: MCPRequest[] = [
                { jsonrpc: '2.0', id: 1, method: MCPMethod.PING },
                { jsonrpc: '2.0', id: 2, method: MCPMethod.PING },
            ];

            await controller.handleBatchRequest(requests);

            expect(Logger.prototype.debug).not.toHaveBeenCalled();
        });

        it('should handle single request without logging', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 10,
                method: MCPMethod.TOOLS_LIST,
            };

            const response = await controller.handleRequest(request);

            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(10);
            expect(Logger.prototype.debug).not.toHaveBeenCalled();
        });

        it('should handle batch request without logging array check', async () => {
            const requests: MCPRequest[] = [
                {
                    jsonrpc: '2.0',
                    id: 5,
                    method: MCPMethod.INITIALIZE,
                    params: {},
                },
                { jsonrpc: '2.0', id: 6, method: MCPMethod.TOOLS_LIST },
            ];

            const responses = await controller.handleBatchRequest(requests);

            expect(responses).toHaveLength(2);
            expect(Logger.prototype.debug).not.toHaveBeenCalled();
        });
    });

    describe('with logging enabled - comprehensive', () => {
        it('should log both request and response', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 100,
                method: MCPMethod.TOOLS_LIST,
            };

            const response = await controller.handleRequest(request);

            expect(response.jsonrpc).toBe('2.0');
            expect(Logger.prototype.debug).toHaveBeenCalledWith(
                expect.stringContaining('Received request'),
            );
            expect(Logger.prototype.debug).toHaveBeenCalledWith(
                expect.stringContaining('Sending response'),
            );
        });

        it('should log batch request with count', async () => {
            const requests: MCPRequest[] = [
                { jsonrpc: '2.0', id: 1, method: MCPMethod.PING },
                { jsonrpc: '2.0', id: 2, method: MCPMethod.PING },
                { jsonrpc: '2.0', id: 3, method: MCPMethod.PING },
            ];

            await controller.handleBatchRequest(requests);

            expect(Logger.prototype.debug).toHaveBeenCalledWith(
                'Received batch request with 3 requests',
            );
        });

        it('should handle empty batch request with logging', async () => {
            const requests: MCPRequest[] = [];

            const responses = await controller.handleBatchRequest(requests);

            expect(responses).toHaveLength(0);
            expect(Logger.prototype.debug).toHaveBeenCalledWith(
                'Received batch request with 0 requests',
            );
        });
    });
});
