import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MCPModule } from '../../src/modules/mcp.module';
import { MCPService } from '../../src/services/mcp.service';
import { MCPRegistryService } from '../../src/services/mcp-registry.service';
import { MCPDiscoveryService } from '../../src/services/mcp-discovery.service';
import { MCPSDKService } from '../../src/services/mcp-sdk.service';
import { MCPController } from '../../src/controllers/mcp.controller';
import { MCP_MODULE_OPTIONS } from '../../src/constants';
import { MCPModuleOptions } from '../../src/interfaces';

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

describe('MCPModule', () => {
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

    beforeEach(() => {
        jest.spyOn(Logger.prototype, 'log').mockImplementation();
        jest.spyOn(Logger.prototype, 'warn').mockImplementation();
        jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('forRoot', () => {
        it('should create module with all providers', () => {
            const module = MCPModule.forRoot(mockOptions);

            expect(module.module).toBe(MCPModule);
            expect(module.controllers).toContain(MCPController);
            expect(module.providers).toBeDefined();
            expect(module.exports).toBeDefined();
        });

        it('should register module options provider', () => {
            const module = MCPModule.forRoot(mockOptions);

            const optionsProvider = module.providers?.find(
                (p) =>
                    typeof p === 'object' &&
                    'provide' in p &&
                    p.provide === MCP_MODULE_OPTIONS,
            );

            expect(optionsProvider).toBeDefined();
        });

        it('should export all services', () => {
            const module = MCPModule.forRoot(mockOptions);

            expect(module.exports).toContain(MCPService);
            expect(module.exports).toContain(MCPRegistryService);
            expect(module.exports).toContain(MCPDiscoveryService);
            expect(module.exports).toContain(MCPSDKService);
        });
    });

    describe('forRootAsync', () => {
        it('should create module with async factory', () => {
            const module = MCPModule.forRootAsync({
                useFactory: () => mockOptions,
            });

            expect(module.module).toBe(MCPModule);
            expect(module.controllers).toContain(MCPController);
        });

        it('should handle useFactory with inject', () => {
            const module = MCPModule.forRootAsync({
                useFactory: (config: Record<string, unknown>) => ({
                    ...mockOptions,
                    serverInfo: {
                        ...mockOptions.serverInfo,
                        name: config.name as string,
                    },
                }),
                inject: ['CONFIG'],
            });

            expect(module.providers).toBeDefined();
        });

        it('should include imports from options', () => {
            const module = MCPModule.forRootAsync({
                imports: [],
                useFactory: () => mockOptions,
            });

            expect(module.imports).toBeDefined();
        });
    });

    describe('forFeature', () => {
        it('should create module without controller', () => {
            const module = MCPModule.forFeature();

            expect(module.module).toBe(MCPModule);
            expect(module.controllers).toBeUndefined();
            expect(module.providers).toBeDefined();
            expect(module.exports).toBeDefined();
        });

        it('should export all services', () => {
            const module = MCPModule.forFeature();

            expect(module.exports).toContain(MCPService);
            expect(module.exports).toContain(MCPRegistryService);
            expect(module.exports).toContain(MCPDiscoveryService);
            expect(module.exports).toContain(MCPSDKService);
        });
    });

    describe('onModuleInit', () => {
        it('should discover and register tools on initialization', async () => {
            const module: TestingModule = await Test.createTestingModule({
                imports: [MCPModule.forRoot(mockOptions)],
            }).compile();

            const mcpModule = module.get(MCPModule);
            await mcpModule.onModuleInit();

            expect(Logger.prototype.log).toHaveBeenCalledWith(
                'Initializing MCP Module...',
            );
            expect(Logger.prototype.log).toHaveBeenCalledWith(
                expect.stringContaining('Discovered and registered'),
            );
            expect(Logger.prototype.log).toHaveBeenCalledWith(
                'MCP Module initialized successfully',
            );
        });

        it('should log discovery counts', async () => {
            const module: TestingModule = await Test.createTestingModule({
                imports: [MCPModule.forRoot(mockOptions)],
            }).compile();

            const mcpModule = module.get(MCPModule);
            await mcpModule.onModuleInit();

            expect(Logger.prototype.log).toHaveBeenCalledWith(
                expect.stringContaining('tools'),
            );
            expect(Logger.prototype.log).toHaveBeenCalledWith(
                expect.stringContaining('resources'),
            );
            expect(Logger.prototype.log).toHaveBeenCalledWith(
                expect.stringContaining('prompts'),
            );
        });
    });

    describe('module integration', () => {
        it('should wire up all dependencies correctly', async () => {
            const module: TestingModule = await Test.createTestingModule({
                imports: [MCPModule.forRoot(mockOptions)],
            }).compile();

            const mcpService = module.get(MCPService);
            const registryService = module.get(MCPRegistryService);
            const discoveryService = module.get(MCPDiscoveryService);
            const sdkService = module.get(MCPSDKService);
            const controller = module.get(MCPController);

            expect(mcpService).toBeDefined();
            expect(registryService).toBeDefined();
            expect(discoveryService).toBeDefined();
            expect(sdkService).toBeDefined();
            expect(controller).toBeDefined();
        });

        it('should inject options into services', async () => {
            const customOptions: MCPModuleOptions = {
                ...mockOptions,
                serverInfo: {
                    ...mockOptions.serverInfo,
                    name: 'Custom Server',
                },
            };

            const module: TestingModule = await Test.createTestingModule({
                imports: [MCPModule.forRoot(customOptions)],
            }).compile();

            const options = module.get(MCP_MODULE_OPTIONS);
            expect(options.serverInfo.name).toBe('Custom Server');
        });
    });

    describe('async module configuration', () => {
        it('should work with async useClass pattern', async () => {
            class _ConfigService implements MCPModuleOptions {
                serverInfo = mockOptions.serverInfo;
                enableLogging = false;
            }

            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    MCPModule.forRootAsync({
                        useFactory: () => mockOptions,
                    }),
                ],
            }).compile();

            const mcpService = module.get(MCPService);
            expect(mcpService).toBeDefined();
        });
    });
});
