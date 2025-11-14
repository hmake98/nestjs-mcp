import { Injectable, Inject } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
    MCP_TOOL_METADATA,
    MCP_RESOURCE_METADATA,
    MCP_PROMPT_METADATA,
    MCP_TOOL_PARAM_METADATA,
    MCP_GUARDS_METADATA,
    MCP_INTERCEPTORS_METADATA,
    MCP_MODULE_OPTIONS,
} from '../constants';
import {
    MCPToolDefinition,
    MCPToolParameter,
    DiscoveredMCPResource,
    DiscoveredMCPPrompt,
    MCPModuleOptions,
} from '../interfaces';
import { zodSchemaToMCPParameters, MCPLogger, LogLevel } from '../utils';

/**
 * Service responsible for discovering MCP tools, resources, and prompts
 * from providers decorated with MCP decorators
 */
@Injectable()
export class MCPDiscoveryService {
    private readonly logger: MCPLogger;

    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector,
        @Inject(MCP_MODULE_OPTIONS)
        private readonly options: MCPModuleOptions,
    ) {
        // Initialize logger with configured log level
        const logLevel =
            this.options.logLevel ??
            (this.options.enableLogging ? LogLevel.DEBUG : LogLevel.INFO);
        this.logger = new MCPLogger(MCPDiscoveryService.name, logLevel);
    }

    /**
     * Discover all MCP tools from providers
     */
    discoverTools(): MCPToolDefinition[] {
        const tools: MCPToolDefinition[] = [];
        const providers = this.discoveryService.getProviders();

        this.logger.debug(`Found ${providers.length} total providers to scan`);

        providers.forEach((wrapper: InstanceWrapper) => {
            const { instance } = wrapper;
            if (!instance || typeof instance !== 'object') {
                return;
            }

            const prototype = Object.getPrototypeOf(instance);
            const methodNames =
                this.metadataScanner.getAllMethodNames(prototype);

            methodNames.forEach((methodName) => {
                // Read metadata from the prototype method, not the instance method
                const toolMetadata = this.reflector.get(
                    MCP_TOOL_METADATA,
                    prototype[methodName],
                );

                if (toolMetadata) {
                    this.logger.debug(
                        `Found tool: ${toolMetadata.name} on ${instance.constructor.name}.${methodName}`,
                    );

                    const paramMetadata =
                        this.reflector.get(
                            MCP_TOOL_PARAM_METADATA,
                            prototype[methodName],
                        ) || [];

                    const guards =
                        this.reflector.get(
                            MCP_GUARDS_METADATA,
                            prototype[methodName],
                        ) || [];

                    const interceptors =
                        this.reflector.get(
                            MCP_INTERCEPTORS_METADATA,
                            prototype[methodName],
                        ) || [];

                    const method = instance[methodName].bind(instance);

                    // Determine parameters from schema, explicit metadata, or function signature
                    let parameters: MCPToolParameter[];
                    if (toolMetadata.schema) {
                        // Use Zod schema if provided
                        parameters = zodSchemaToMCPParameters(
                            toolMetadata.schema,
                        );
                    } else if (
                        paramMetadata.length > 0 &&
                        paramMetadata[0]?.name
                    ) {
                        // Use explicit parameter definitions with names
                        parameters = paramMetadata as MCPToolParameter[];
                    } else {
                        // Fallback: try to extract from function signature (will return empty for single 'params' object)
                        parameters = [];
                    }

                    tools.push({
                        name: toolMetadata.name,
                        description: toolMetadata.description,
                        parameters,
                        handler: method,
                        schema: toolMetadata.schema, // Store schema for runtime validation
                        version: toolMetadata.version,
                        deprecated: toolMetadata.deprecation?.deprecated,
                        deprecationMessage: toolMetadata.deprecation?.message
                            ? this.buildDeprecationMessage(
                                  toolMetadata.deprecation,
                              )
                            : undefined,
                        guards,
                        interceptors,
                        instance,
                        methodName,
                    });
                }
            });
        });

        return tools;
    }

    /**
     * Discover all MCP resources from providers
     */
    discoverResources(): DiscoveredMCPResource[] {
        const resources: DiscoveredMCPResource[] = [];
        const providers = this.discoveryService.getProviders();

        providers.forEach((wrapper: InstanceWrapper) => {
            const { instance } = wrapper;
            if (!instance || typeof instance !== 'object') {
                return;
            }

            const prototype = Object.getPrototypeOf(instance);
            const methodNames =
                this.metadataScanner.getAllMethodNames(prototype);

            methodNames.forEach((methodName) => {
                // Read metadata from the prototype method, not the instance method
                const resourceMetadata = this.reflector.get(
                    MCP_RESOURCE_METADATA,
                    prototype[methodName],
                );

                if (resourceMetadata) {
                    const guards =
                        this.reflector.get(
                            MCP_GUARDS_METADATA,
                            prototype[methodName],
                        ) || [];

                    const interceptors =
                        this.reflector.get(
                            MCP_INTERCEPTORS_METADATA,
                            prototype[methodName],
                        ) || [];

                    const method = instance[methodName].bind(instance);
                    resources.push({
                        ...resourceMetadata,
                        handler: method,
                        version: resourceMetadata.version,
                        deprecated: resourceMetadata.deprecation?.deprecated,
                        deprecationMessage: resourceMetadata.deprecation
                            ?.message
                            ? this.buildDeprecationMessage(
                                  resourceMetadata.deprecation,
                              )
                            : undefined,
                        guards,
                        interceptors,
                        instance,
                        methodName,
                    });
                }
            });
        });

        return resources;
    }

    /**
     * Discover all MCP prompts from providers
     */
    discoverPrompts(): DiscoveredMCPPrompt[] {
        const prompts: DiscoveredMCPPrompt[] = [];
        const providers = this.discoveryService.getProviders();

        providers.forEach((wrapper: InstanceWrapper) => {
            const { instance } = wrapper;
            if (!instance || typeof instance !== 'object') {
                return;
            }

            const prototype = Object.getPrototypeOf(instance);
            const methodNames =
                this.metadataScanner.getAllMethodNames(prototype);

            methodNames.forEach((methodName) => {
                // Read metadata from the prototype method, not the instance method
                const promptMetadata = this.reflector.get(
                    MCP_PROMPT_METADATA,
                    prototype[methodName],
                );

                if (promptMetadata) {
                    const guards =
                        this.reflector.get(
                            MCP_GUARDS_METADATA,
                            prototype[methodName],
                        ) || [];

                    const interceptors =
                        this.reflector.get(
                            MCP_INTERCEPTORS_METADATA,
                            prototype[methodName],
                        ) || [];

                    const method = instance[methodName].bind(instance);

                    // Extract arguments from schema if provided
                    let arguments_: Array<{
                        name: string;
                        description?: string;
                        required?: boolean;
                    }> = promptMetadata.arguments || [];

                    if (
                        promptMetadata.schema &&
                        (!arguments_ || arguments_.length === 0)
                    ) {
                        // Generate arguments from schema
                        const parameters = zodSchemaToMCPParameters(
                            promptMetadata.schema,
                        );
                        arguments_ = parameters.map((p) => ({
                            name: p.name,
                            description: p.description,
                            required: p.required,
                        }));
                    }

                    prompts.push({
                        name: promptMetadata.name,
                        description: promptMetadata.description,
                        arguments: arguments_,
                        handler: method,
                        schema: promptMetadata.schema, // Store schema for runtime validation
                        version: promptMetadata.version,
                        deprecated: promptMetadata.deprecation?.deprecated,
                        deprecationMessage: promptMetadata.deprecation?.message
                            ? this.buildDeprecationMessage(
                                  promptMetadata.deprecation,
                              )
                            : undefined,
                        guards,
                        interceptors,
                        instance,
                        methodName,
                    });
                }
            });
        });

        return prompts;
    }

    /**
     * Extract parameters from method signature and metadata
     */
    private extractParameters(
        method: (...args: unknown[]) => unknown,
        paramMetadata: Array<Partial<Omit<MCPToolParameter, 'name'>>>,
    ): MCPToolParameter[] {
        const paramNames = this.getParameterNames(method);

        return paramNames.map((name, index) => {
            const metadata = paramMetadata[index] || {};
            return {
                name,
                type: (metadata.type as MCPToolParameter['type']) || 'string',
                description: metadata.description,
                required: metadata.required ?? true,
                default: metadata.default,
                enum: metadata.enum,
            };
        });
    }

    /**
     * Get parameter names from function signature
     */
    private getParameterNames(func: (...args: unknown[]) => unknown): string[] {
        const funcStr = func.toString();
        const match = funcStr.match(/\(([^)]*)\)/);

        if (!match || !match[1]) {
            return [];
        }

        return match[1]
            .split(',')
            .map((param) => param.trim().split('=')[0].trim())
            .filter((param) => param && param !== '');
    }

    /**
     * Build deprecation message from deprecation info
     */
    private buildDeprecationMessage(deprecation: {
        deprecated: boolean;
        message?: string;
        since?: string;
        removeIn?: string;
        replacedBy?: string;
    }): string {
        let msg = deprecation.message || 'This item is deprecated.';

        if (deprecation.since) {
            msg += ` Deprecated since ${deprecation.since}.`;
        }

        if (deprecation.removeIn) {
            msg += ` Will be removed in ${deprecation.removeIn}.`;
        }

        if (deprecation.replacedBy) {
            msg += ` Use '${deprecation.replacedBy}' instead.`;
        }

        return msg;
    }
}
