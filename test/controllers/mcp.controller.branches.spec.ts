import { Test, TestingModule } from '@nestjs/testing';
import { MCPController } from '../../src/controllers/mcp.controller';
import { MCPService } from '../../src/services/mcp.service';
import { MCPRegistryService } from '../../src/services/mcp-registry.service';
import { MCPExecutionService } from '../../src/services/mcp-execution.service';
import { MCP_MODULE_OPTIONS } from '../../src/constants';
import { MCPModuleOptions, MCPRequest } from '../../src/interfaces';
import * as fs from 'node:fs';
import { Logger } from '@nestjs/common';

jest.mock('node:fs');

describe('MCPController branch toggles', () => {
    let controller: MCPController;

    const mockOptions: MCPModuleOptions = {
        serverInfo: {
            name: 'Test Server',
            version: '1.0.0',
            capabilities: { tools: {}, resources: {}, prompts: {} },
        },
        enableLogging: true,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MCPController],
            providers: [
                MCPService,
                MCPRegistryService,
                MCPExecutionService,
                {
                    provide: MCP_MODULE_OPTIONS,
                    useValue: mockOptions,
                },
            ],
        }).compile();

        controller = module.get<MCPController>(MCPController);
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should hit both logging branches for handleRequest', async () => {
        const req = {
            jsonrpc: '2.0',
            id: 1,
            method: 'ping',
        } as unknown as MCPRequest;

        // Ensure logging true branch
        const ctrl = controller as unknown as { options: MCPModuleOptions };
        ctrl.options.enableLogging = true;
        await controller.handleRequest(req);

        // Now flip to false and run again to hit the other branch
        ctrl.options.enableLogging = false;
        await controller.handleRequest(req);
    });

    it('should hit both logging branches for handleBatchRequest and array check', async () => {
        type ControllerWithOptions = { options: MCPModuleOptions };
        const requests: MCPRequest[] = [
            { jsonrpc: '2.0', id: 1, method: 'ping' } as unknown as MCPRequest,
        ];

        // logging true
        const ctrl2 = controller as unknown as ControllerWithOptions;
        ctrl2.options.enableLogging = true;
        await controller.handleBatchRequest(requests);

        // logging false
        ctrl2.options.enableLogging = false;
        await controller.handleBatchRequest(requests);

        // test non-array throws
        const invalidRequest = {} as unknown as MCPRequest[];
        await expect(
            controller.handleBatchRequest(invalidRequest),
        ).rejects.toThrow('Batch request must be an array');
    });

    it('should hit both logging branches for getPlayground success and error', () => {
        type ControllerWithOptions = { options: MCPModuleOptions };
        type ExpressResponse = import('express').Response;
        const mockRes = {
            setHeader: jest.fn(),
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as unknown as ExpressResponse;

        // success path with logging enabled
        (fs.readFileSync as jest.Mock<string>).mockReturnValue('<html></html>');
        (controller as unknown as ControllerWithOptions).options.enableLogging =
            true;
        controller.getPlayground(mockRes);

        // error path with logging disabled
        (fs.readFileSync as jest.Mock<string>).mockImplementation(() => {
            throw new Error('fail');
        });
        (controller as unknown as ControllerWithOptions).options.enableLogging =
            false;
        controller.getPlayground(mockRes);
    });
});
