import { Test, TestingModule } from '@nestjs/testing';
import { Module } from '@nestjs/common';
import { MCPModule } from '../../src/modules/mcp.module';
import { MCP_MODULE_OPTIONS } from '../../src/constants';
import { MCPModuleOptions, MCPOptionsFactory } from '../../src/interfaces';

// Mock the MCP SDK
jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
    McpServer: jest.fn().mockImplementation(() => ({
        registerTool: jest.fn(),
        registerResource: jest.fn(),
        registerPrompt: jest.fn(),
        connect: jest.fn(),
        close: jest.fn(),
    })),
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
    StdioServerTransport: jest.fn(),
}));

describe('MCPModule Async Configuration', () => {
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
        enableLogging: false,
    };

    describe('useClass pattern', () => {
        it('should work with useClass', async () => {
            class TestOptionsFactory implements MCPOptionsFactory {
                createMCPOptions():
                    | Promise<MCPModuleOptions>
                    | MCPModuleOptions {
                    return mockOptions;
                }
            }

            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    MCPModule.forRootAsync({
                        useClass: TestOptionsFactory,
                    }),
                ],
            }).compile();

            const options = module.get(MCP_MODULE_OPTIONS);
            expect(options).toEqual(mockOptions);
        });

        it('should throw error when no configuration method provided', () => {
            expect(() => {
                MCPModule.forRootAsync({} as never);
            }).toThrow(
                'Invalid MCPModuleAsyncOptions: must provide useFactory, useClass, or useExisting',
            );
        });
    });

    describe('useExisting pattern', () => {
        it('should work with useExisting', async () => {
            class TestOptionsFactory implements MCPOptionsFactory {
                createMCPOptions():
                    | Promise<MCPModuleOptions>
                    | MCPModuleOptions {
                    return mockOptions;
                }
            }

            @Module({
                providers: [TestOptionsFactory],
                exports: [TestOptionsFactory],
            })
            class TestModule {}

            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    MCPModule.forRootAsync({
                        imports: [TestModule],
                        useExisting: TestOptionsFactory,
                    }),
                ],
            }).compile();

            const options = module.get(MCP_MODULE_OPTIONS);
            expect(options).toBeDefined();
        });
    });
});
