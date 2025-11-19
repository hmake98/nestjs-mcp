import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { Response } from 'express';
import { createMCPController } from '../../src/controllers/mcp.controller';
import { MCPService } from '../../src/services/mcp.service';
import { MCPRegistryService } from '../../src/services/mcp-registry.service';
import { MCPExecutionService } from '../../src/services/mcp-execution.service';
import { MCPRequest, MCPModuleOptions } from '../../src/interfaces';
import { MCP_MODULE_OPTIONS, MCPMethod } from '../../src/constants';
import * as fs from 'node:fs';

// Mock fs module
jest.mock('node:fs');

describe('createMCPController Factory', () => {
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

    beforeEach(() => {
        jest.spyOn(Logger.prototype, 'log').mockImplementation();
        jest.spyOn(Logger.prototype, 'debug').mockImplementation();
        jest.spyOn(Logger.prototype, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Factory with default path', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let controller: any;

        beforeEach(async () => {
            const ControllerClass = createMCPController('mcp');
            const module: TestingModule = await Test.createTestingModule({
                controllers: [ControllerClass],
                providers: [
                    MCPService,
                    MCPRegistryService,
                    MCPExecutionService,
                    {
                        provide: MCP_MODULE_OPTIONS,
                        useValue: mockOptions,
                    },
                    {
                        provide: ModuleRef,
                        useValue: {
                            get: jest.fn(),
                        },
                    },
                ],
            }).compile();

            const controllers = module.get(ControllerClass);
            controller = controllers;
        });

        it('should handle requests with logging enabled', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.PING,
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

        it('should handle batch requests with logging', async () => {
            const requests: MCPRequest[] = [
                { jsonrpc: '2.0', id: 1, method: MCPMethod.PING },
                { jsonrpc: '2.0', id: 2, method: MCPMethod.PING },
            ];

            const responses = await controller.handleBatchRequest(requests);

            expect(responses).toHaveLength(2);
            expect(Logger.prototype.debug).toHaveBeenCalledWith(
                'Received batch request with 2 requests',
            );
        });

        it('should throw error for invalid batch request', async () => {
            const invalidInput = { not: 'array' } as unknown as MCPRequest[];

            await expect(
                controller.handleBatchRequest(invalidInput),
            ).rejects.toThrow('Batch request must be an array');
        });

        it('should serve playground with logging', () => {
            const mockRes = {
                setHeader: jest.fn(),
                send: jest.fn(),
                status: jest.fn().mockReturnThis(),
            } as unknown as Response;

            (fs.readFileSync as jest.Mock).mockReturnValue(
                '<html>Playground</html>',
            );

            controller.getPlayground(mockRes);

            expect(Logger.prototype.log).toHaveBeenCalledWith(
                'Serving MCP Playground UI',
            );
            expect(mockRes.setHeader).toHaveBeenCalledWith(
                'Content-Type',
                'text/html',
            );
        });

        it('should handle playground errors with logging', () => {
            const mockRes = {
                setHeader: jest.fn(),
                send: jest.fn(),
                status: jest.fn().mockReturnThis(),
            } as unknown as Response;

            (fs.readFileSync as jest.Mock).mockImplementation(() => {
                throw new Error('File not found');
            });

            controller.getPlayground(mockRes);

            expect(Logger.prototype.error).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.send).toHaveBeenCalledWith(
                'Playground UI not available',
            );
        });
    });

    describe('Factory with root path', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let controller: any;

        beforeEach(async () => {
            const ControllerClass = createMCPController('/mcp');
            const module: TestingModule = await Test.createTestingModule({
                controllers: [ControllerClass],
                providers: [
                    MCPService,
                    MCPRegistryService,
                    MCPExecutionService,
                    {
                        provide: MCP_MODULE_OPTIONS,
                        useValue: mockOptions,
                    },
                    {
                        provide: ModuleRef,
                        useValue: {
                            get: jest.fn(),
                        },
                    },
                ],
            }).compile();

            controller = module.get(ControllerClass);
        });

        it('should handle requests at root path', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.PING,
            };

            const response = await controller.handleRequest(request);

            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(1);
        });

        it('should handle batch requests at root path', async () => {
            const requests: MCPRequest[] = [
                { jsonrpc: '2.0', id: 1, method: MCPMethod.PING },
                { jsonrpc: '2.0', id: 2, method: MCPMethod.TOOLS_LIST },
            ];

            const responses = await controller.handleBatchRequest(requests);

            expect(responses).toHaveLength(2);
            expect(responses[0].id).toBe(1);
            expect(responses[1].id).toBe(2);
        });
    });

    describe('Factory with custom publicMetadataKey', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let controller: any;

        beforeEach(async () => {
            const ControllerClass = createMCPController('mcp', 'isPublic');
            const module: TestingModule = await Test.createTestingModule({
                controllers: [ControllerClass],
                providers: [
                    MCPService,
                    MCPRegistryService,
                    MCPExecutionService,
                    {
                        provide: MCP_MODULE_OPTIONS,
                        useValue: mockOptions,
                    },
                    {
                        provide: ModuleRef,
                        useValue: {
                            get: jest.fn(),
                        },
                    },
                ],
            }).compile();

            controller = module.get(ControllerClass);
        });

        it('should handle requests with custom metadata key', async () => {
            const request: MCPRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: MCPMethod.PING,
            };

            const response = await controller.handleRequest(request);

            expect(response.jsonrpc).toBe('2.0');
            expect(response.id).toBe(1);
        });
    });

    describe('Factory with logging disabled', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let controller: any;

        beforeEach(async () => {
            const ControllerClass = createMCPController('mcp');
            const module: TestingModule = await Test.createTestingModule({
                controllers: [ControllerClass],
                providers: [
                    MCPService,
                    MCPRegistryService,
                    MCPExecutionService,
                    {
                        provide: MCP_MODULE_OPTIONS,
                        useValue: {
                            ...mockOptions,
                            enableLogging: false,
                        },
                    },
                    {
                        provide: ModuleRef,
                        useValue: {
                            get: jest.fn(),
                        },
                    },
                ],
            }).compile();

            controller = module.get(ControllerClass);
            jest.clearAllMocks();
        });

        it('should not log requests when logging is disabled', async () => {
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
            ];

            await controller.handleBatchRequest(requests);

            expect(Logger.prototype.debug).not.toHaveBeenCalled();
        });

        it('should not log playground when logging is disabled', () => {
            const mockRes = {
                setHeader: jest.fn(),
                send: jest.fn(),
                status: jest.fn().mockReturnThis(),
            } as unknown as Response;

            (fs.readFileSync as jest.Mock).mockReturnValue(
                '<html>Playground</html>',
            );

            controller.getPlayground(mockRes);

            expect(Logger.prototype.log).not.toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let controller: any;

        beforeEach(async () => {
            const ControllerClass = createMCPController('mcp');
            const module: TestingModule = await Test.createTestingModule({
                controllers: [ControllerClass],
                providers: [
                    MCPService,
                    MCPRegistryService,
                    MCPExecutionService,
                    {
                        provide: MCP_MODULE_OPTIONS,
                        useValue: mockOptions,
                    },
                    {
                        provide: ModuleRef,
                        useValue: {
                            get: jest.fn(),
                        },
                    },
                ],
            }).compile();

            controller = module.get(ControllerClass);
        });

        it('should handle empty batch request', async () => {
            const requests: MCPRequest[] = [];

            const responses = await controller.handleBatchRequest(requests);

            expect(responses).toHaveLength(0);
            expect(Logger.prototype.debug).toHaveBeenCalledWith(
                'Received batch request with 0 requests',
            );
        });

        it('should handle single item batch request', async () => {
            const requests: MCPRequest[] = [
                { jsonrpc: '2.0', id: 1, method: MCPMethod.PING },
            ];

            const responses = await controller.handleBatchRequest(requests);

            expect(responses).toHaveLength(1);
            expect(Logger.prototype.debug).toHaveBeenCalledWith(
                'Received batch request with 1 requests',
            );
        });

        it('should handle large batch request', async () => {
            const requests: MCPRequest[] = Array.from(
                { length: 100 },
                (_, i) => ({
                    jsonrpc: '2.0' as const,
                    id: i + 1,
                    method: MCPMethod.PING,
                }),
            );

            const responses = await controller.handleBatchRequest(requests);

            expect(responses).toHaveLength(100);
            expect(Logger.prototype.debug).toHaveBeenCalledWith(
                'Received batch request with 100 requests',
            );
        });
    });
});
