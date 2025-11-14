import {
    DynamicModule,
    Global,
    Module,
    OnApplicationBootstrap,
    Inject,
    Provider,
} from '@nestjs/common';
import { DiscoveryModule, Reflector } from '@nestjs/core';
import {
    MCPModuleOptions,
    MCPModuleAsyncOptions,
    MCPOptionsFactory,
} from '../interfaces';
import { MCP_MODULE_OPTIONS } from '../constants';
import {
    MCPService,
    MCPRegistryService,
    MCPDiscoveryService,
    MCPSDKService,
    MCPExecutionService,
} from '../services';
import { MCPController } from '../controllers';
import { MCPLogger, LogLevel } from '../utils';

/**
 * Main MCP Module for NestJS integration
 */
@Global()
@Module({})
export class MCPModule implements OnApplicationBootstrap {
    private readonly logger: MCPLogger;
    private discoveryComplete = false;

    constructor(
        @Inject(MCP_MODULE_OPTIONS)
        private readonly options: MCPModuleOptions,
        private readonly discoveryService: MCPDiscoveryService,
        private readonly registryService: MCPRegistryService,
    ) {
        // Initialize logger with configured log level
        const logLevel =
            this.options.logLevel ??
            (this.options.enableLogging ? LogLevel.DEBUG : LogLevel.INFO);
        this.logger = new MCPLogger(MCPModule.name, logLevel);
    }

    /**
     * Perform discovery - can be called multiple times safely
     */
    private performDiscovery(): void {
        if (this.discoveryComplete) {
            return;
        }

        this.logger.log('Initializing MCP Module...');

        // Discover and register tools
        const tools = this.discoveryService.discoverTools();
        this.registryService.registerTools(tools);
        this.logger.log(`Discovered and registered ${tools.length} tools`);

        // Discover and register resources
        const resources = this.discoveryService.discoverResources();
        this.registryService.registerResources(resources);
        this.logger.log(
            `Discovered and registered ${resources.length} resources`,
        );

        // Discover and register prompts
        const prompts = this.discoveryService.discoverPrompts();
        this.registryService.registerPrompts(prompts);
        this.logger.log(`Discovered and registered ${prompts.length} prompts`);

        this.logger.log('MCP Module initialized successfully');
        this.discoveryComplete = true;
    }

    /**
     * Register the MCP module with synchronous options
     */
    static forRoot(options: MCPModuleOptions): DynamicModule {
        return {
            global: true,
            module: MCPModule,
            imports: [DiscoveryModule],
            controllers: [MCPController],
            providers: [
                {
                    provide: MCP_MODULE_OPTIONS,
                    useValue: options,
                },
                Reflector,
                MCPRegistryService,
                MCPDiscoveryService,
                MCPSDKService,
                MCPExecutionService,
                MCPService,
            ],
            exports: [
                MCPService,
                MCPRegistryService,
                MCPDiscoveryService,
                MCPSDKService,
                MCPExecutionService,
            ],
        };
    }

    /**
     * Register the MCP module with asynchronous options
     */
    static forRootAsync(options: MCPModuleAsyncOptions): DynamicModule {
        return {
            global: true,
            module: MCPModule,
            imports: [DiscoveryModule, ...(options.imports || [])],
            controllers: [MCPController],
            providers: [
                ...this.createAsyncProviders(options),
                Reflector,
                MCPRegistryService,
                MCPDiscoveryService,
                MCPSDKService,
                MCPExecutionService,
                MCPService,
            ],
            exports: [
                MCPService,
                MCPRegistryService,
                MCPDiscoveryService,
                MCPSDKService,
                MCPExecutionService,
            ],
        };
    }

    /**
     * Register the MCP module for features (without controller)
     * Use this when you want to use MCP services in a module without exposing HTTP endpoints
     */
    static forFeature(): DynamicModule {
        return {
            module: MCPModule,
            imports: [DiscoveryModule],
            providers: [
                Reflector,
                MCPRegistryService,
                MCPDiscoveryService,
                MCPSDKService,
                MCPExecutionService,
                MCPService,
            ],
            exports: [
                MCPService,
                MCPRegistryService,
                MCPDiscoveryService,
                MCPSDKService,
                MCPExecutionService,
            ],
        };
    }

    /**
     * Initialize module and discover tools, resources, and prompts
     * This runs after all modules have been initialized
     */
    async onApplicationBootstrap() {
        // Add a small delay to ensure all providers are fully initialized
        await new Promise((resolve) => setTimeout(resolve, 100));
        this.performDiscovery();
    }

    /**
     * Create async providers for the module
     */
    private static createAsyncProviders(
        options: MCPModuleAsyncOptions,
    ): Provider[] {
        if (options.useFactory) {
            return [
                {
                    provide: MCP_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
            ];
        }

        const useClass = options.useClass || options.useExisting;

        if (!useClass) {
            throw new Error(
                'Invalid MCPModuleAsyncOptions: must provide useFactory, useClass, or useExisting',
            );
        }

        return [
            {
                provide: MCP_MODULE_OPTIONS,
                useFactory: async (optionsFactory: MCPOptionsFactory) =>
                    await optionsFactory.createMCPOptions(),
                inject: [useClass],
            },
            ...(options.useClass
                ? [
                      {
                          provide: useClass,
                          useClass: useClass,
                      },
                  ]
                : []),
        ];
    }
}
