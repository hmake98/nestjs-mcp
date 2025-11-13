import { Injectable, Inject } from '@nestjs/common';
import {
    MCPRequest,
    MCPResponse,
    MCPError,
    MCPToolResult,
    MCPInitializeRequest,
    MCPInitializeResponse,
    MCPModuleOptions,
    MCPToolParameter,
    JSONValue,
    JSONObject,
} from '../interfaces';
import {
    MCPErrorCode,
    MCPMethod,
    MCP_PROTOCOL_VERSION,
    MCP_MODULE_OPTIONS,
} from '../constants';
import { MCPRegistryService } from './mcp-registry.service';
import {
    safeValidateWithZod,
    zodToJsonSchema,
    MCPLogger,
    LogLevel,
} from '../utils';

/**
 * Main MCP service for handling protocol requests
 */
@Injectable()
export class MCPService {
    private readonly logger: MCPLogger;
    private initialized = false;

    constructor(
        @Inject(MCP_MODULE_OPTIONS)
        private readonly options: MCPModuleOptions,
        private readonly registryService: MCPRegistryService,
    ) {
        // Initialize logger with configured log level
        const logLevel =
            this.options.logLevel ??
            (this.options.enableLogging ? LogLevel.DEBUG : LogLevel.INFO);
        this.logger = new MCPLogger(MCPService.name, logLevel);
    }

    /**
     * Get the SDK server instance (for advanced usage)
     */
    getSDKServer(): unknown {
        // This will be injected by the module
        return null;
    }

    /**
     * Handle an MCP request
     */
    async handleRequest(request: MCPRequest): Promise<MCPResponse> {
        try {
            if (this.options.enableLogging) {
                this.logger.debug(`Handling request: ${request.method}`);
            }

            switch (request.method) {
                case MCPMethod.INITIALIZE:
                    return this.handleInitialize(
                        request as MCPInitializeRequest,
                    );
                case MCPMethod.PING:
                    return this.handlePing(request);
                case MCPMethod.TOOLS_LIST:
                    return this.handleToolsList(request);
                case MCPMethod.TOOLS_CALL:
                    return this.handleToolsCall(request);
                case MCPMethod.RESOURCES_LIST:
                    return this.handleResourcesList(request);
                case MCPMethod.RESOURCES_READ:
                    return this.handleResourcesRead(request);
                case MCPMethod.PROMPTS_LIST:
                    return this.handlePromptsList(request);
                case MCPMethod.PROMPTS_GET:
                    return this.handlePromptsGet(request);
                default:
                    return this.createErrorResponse(
                        request.id,
                        MCPErrorCode.METHOD_NOT_FOUND,
                        `Method not found: ${request.method}`,
                    );
            }
        } catch (error) {
            return this.handleError(request.id, error);
        }
    }

    /**
     * Handle initialize request
     */
    private handleInitialize(
        request: MCPInitializeRequest,
    ): MCPInitializeResponse {
        this.initialized = true;

        return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
                protocolVersion: MCP_PROTOCOL_VERSION,
                capabilities: this.options.serverInfo.capabilities || {},
                serverInfo: this.options.serverInfo,
            },
        };
    }

    /**
     * Handle ping request
     */
    private handlePing(request: MCPRequest): MCPResponse {
        return {
            jsonrpc: '2.0',
            id: request.id,
            result: {},
        };
    }

    /**
     * Handle tools/list request
     */
    private handleToolsList(request: MCPRequest): MCPResponse {
        const tools = this.registryService.getAllTools();

        return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
                tools: tools.map((tool) => {
                    // If Zod schema is available, use it to generate JSON Schema
                    const inputSchema = tool.schema
                        ? zodToJsonSchema(tool.schema)
                        : {
                              type: 'object',
                              properties: this.buildParameterSchema(
                                  tool.parameters,
                              ),
                              required: tool.parameters
                                  .filter((p) => p.required)
                                  .map((p) => p.name),
                          };

                    const result: {
                        name: string;
                        description: string;
                        inputSchema: unknown;
                        version?: string;
                        deprecated?: boolean;
                        deprecationMessage?: string;
                    } = {
                        name: tool.name,
                        description: tool.description,
                        inputSchema,
                    };

                    // Add version and deprecation info if present
                    if (tool.version) {
                        result.version = tool.version;
                    }
                    if (tool.deprecated) {
                        result.deprecated = tool.deprecated;
                    }
                    if (tool.deprecationMessage) {
                        result.deprecationMessage = tool.deprecationMessage;
                    }

                    return result;
                }),
            },
        };
    }

    /**
     * Handle tools/call request
     */
    private async handleToolsCall(request: MCPRequest): Promise<MCPResponse> {
        const params = request.params || {};
        const name = typeof params.name === 'string' ? params.name : undefined;
        const args =
            typeof params.arguments === 'object' && params.arguments !== null
                ? (params.arguments as JSONObject)
                : {};

        if (!name) {
            return this.createErrorResponse(
                request.id,
                MCPErrorCode.INVALID_PARAMS,
                'Tool name is required',
            );
        }

        const tool = this.registryService.getTool(name);

        if (!tool) {
            return this.createErrorResponse(
                request.id,
                MCPErrorCode.METHOD_NOT_FOUND,
                `Tool not found: ${name}`,
            );
        }

        // Log deprecation warning if tool is deprecated
        if (tool.deprecated) {
            this.logger.warn(
                `Tool '${name}' is deprecated. ${tool.deprecationMessage || ''}`,
            );
        }

        try {
            // Validate input with Zod schema if provided
            let validatedArgs = args;
            if (tool.schema) {
                const validation = safeValidateWithZod(tool.schema, args);
                if (!validation.success) {
                    return this.createErrorResponse(
                        request.id,
                        MCPErrorCode.INVALID_PARAMS,
                        `Invalid tool arguments: ${validation.error.message}`,
                    );
                }
                validatedArgs = validation.data as JSONObject;
            }

            const result = await tool.handler(validatedArgs);
            const toolResult: MCPToolResult = this.normalizeToolResult(result);

            return {
                jsonrpc: '2.0',
                id: request.id,
                result: toolResult,
            };
        } catch (error) {
            return {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                },
            };
        }
    }

    /**
     * Handle resources/list request
     */
    private handleResourcesList(request: MCPRequest): MCPResponse {
        const resources = this.registryService.getAllResources();

        return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
                resources: resources.map((resource) => {
                    const result: {
                        uri?: string;
                        name: string;
                        description?: string;
                        mimeType?: string;
                        version?: string;
                        deprecated?: boolean;
                        deprecationMessage?: string;
                    } = {
                        uri: resource.uri || resource.uriTemplate,
                        name: resource.name,
                        description: resource.description,
                        mimeType: resource.mimeType,
                    };

                    // Add version and deprecation info if present
                    if (resource.version) {
                        result.version = resource.version;
                    }
                    if (resource.deprecated) {
                        result.deprecated = resource.deprecated;
                    }
                    if (resource.deprecationMessage) {
                        result.deprecationMessage = resource.deprecationMessage;
                    }

                    return result;
                }),
            },
        };
    }

    /**
     * Handle resources/read request
     */
    private async handleResourcesRead(
        request: MCPRequest,
    ): Promise<MCPResponse> {
        const params = request.params || {};
        const uri = typeof params.uri === 'string' ? params.uri : undefined;

        if (!uri) {
            return this.createErrorResponse(
                request.id,
                MCPErrorCode.INVALID_PARAMS,
                'Resource URI is required',
            );
        }

        let resource = this.registryService.getResource(uri);

        if (!resource) {
            resource = this.registryService.findResourceByPattern(uri);
        }

        if (!resource) {
            return this.createErrorResponse(
                request.id,
                MCPErrorCode.METHOD_NOT_FOUND,
                `Resource not found: ${uri}`,
            );
        }

        // Log deprecation warning if resource is deprecated
        if (resource.deprecated) {
            this.logger.warn(
                `Resource '${uri}' is deprecated. ${resource.deprecationMessage || ''}`,
            );
        }

        try {
            const variables = resource.uriTemplate
                ? this.registryService.extractUriVariables(
                      resource.uriTemplate,
                      uri,
                  )
                : {};

            // Validate URI template variables with Zod schema if provided
            let validatedVariables = variables;
            if (resource.schema && Object.keys(variables).length > 0) {
                const validation = safeValidateWithZod(
                    resource.schema,
                    variables,
                );
                if (!validation.success) {
                    return this.createErrorResponse(
                        request.id,
                        MCPErrorCode.INVALID_PARAMS,
                        `Invalid resource variables: ${validation.error.message}`,
                    );
                }
                validatedVariables = validation.data as Record<string, string>;
            }

            const content = await resource.handler(validatedVariables);

            return {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                    contents: Array.isArray(content) ? content : [content],
                },
            };
        } catch (error) {
            return this.handleError(request.id, error);
        }
    }

    /**
     * Handle prompts/list request
     */
    private handlePromptsList(request: MCPRequest): MCPResponse {
        const prompts = this.registryService.getAllPrompts();

        return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
                prompts: prompts.map((prompt) => {
                    const result: {
                        name: string;
                        description?: string;
                        arguments?: Array<{
                            name: string;
                            description?: string;
                            required?: boolean;
                        }>;
                        version?: string;
                        deprecated?: boolean;
                        deprecationMessage?: string;
                    } = {
                        name: prompt.name,
                        description: prompt.description,
                        arguments: prompt.arguments,
                    };

                    // Add version and deprecation info if present
                    if (prompt.version) {
                        result.version = prompt.version;
                    }
                    if (prompt.deprecated) {
                        result.deprecated = prompt.deprecated;
                    }
                    if (prompt.deprecationMessage) {
                        result.deprecationMessage = prompt.deprecationMessage;
                    }

                    return result;
                }),
            },
        };
    }

    /**
     * Handle prompts/get request
     */
    private async handlePromptsGet(request: MCPRequest): Promise<MCPResponse> {
        const params = request.params || {};
        const name = typeof params.name === 'string' ? params.name : undefined;
        const args =
            typeof params.arguments === 'object' && params.arguments !== null
                ? (params.arguments as JSONObject)
                : {};

        if (!name) {
            return this.createErrorResponse(
                request.id,
                MCPErrorCode.INVALID_PARAMS,
                'Prompt name is required',
            );
        }

        const prompt = this.registryService.getPrompt(name);

        if (!prompt) {
            return this.createErrorResponse(
                request.id,
                MCPErrorCode.METHOD_NOT_FOUND,
                `Prompt not found: ${name}`,
            );
        }

        // Log deprecation warning if prompt is deprecated
        if (prompt.deprecated) {
            this.logger.warn(
                `Prompt '${name}' is deprecated. ${prompt.deprecationMessage || ''}`,
            );
        }

        try {
            // Validate prompt arguments with Zod schema if provided
            let validatedArgs = args;
            if (prompt.schema) {
                const validation = safeValidateWithZod(prompt.schema, args);
                if (!validation.success) {
                    return this.createErrorResponse(
                        request.id,
                        MCPErrorCode.INVALID_PARAMS,
                        `Invalid prompt arguments: ${validation.error.message}`,
                    );
                }
                validatedArgs = validation.data as JSONObject;
            }

            const messages = await prompt.handler(validatedArgs);

            return {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                    messages: Array.isArray(messages) ? messages : [messages],
                },
            };
        } catch (error) {
            return this.handleError(request.id, error);
        }
    }

    /**
     * Build parameter schema from tool parameters
     */
    private buildParameterSchema(
        parameters: MCPToolParameter[],
    ): Record<string, unknown> {
        const schema: Record<string, unknown> = {};

        parameters.forEach((param) => {
            schema[param.name] = {
                type: param.type,
                description: param.description,
                ...(param.enum && { enum: param.enum }),
                ...(param.default !== undefined && { default: param.default }),
            };
        });

        return schema;
    }

    /**
     * Normalize tool result to MCPToolResult format
     */
    private normalizeToolResult(result: JSONValue): MCPToolResult {
        if (
            result &&
            typeof result === 'object' &&
            !Array.isArray(result) &&
            'content' in result
        ) {
            return result as unknown as MCPToolResult;
        }

        return {
            content: [
                {
                    type: 'text',
                    text:
                        typeof result === 'string'
                            ? result
                            : JSON.stringify(result),
                },
            ],
        };
    }

    /**
     * Create error response
     */
    private createErrorResponse(
        id: string | number,
        code: MCPErrorCode,
        message: string,
        data?: JSONValue,
    ): MCPResponse {
        const error: MCPError = { code, message };
        if (data) {
            error.data = data;
        }

        return {
            jsonrpc: '2.0',
            id,
            error,
        };
    }

    /**
     * Handle errors
     */
    private handleError(id: string | number, error: unknown): MCPResponse {
        this.logger.error('Error handling request:', error);

        if (this.options.errorHandler) {
            try {
                const customError = this.options.errorHandler(
                    error instanceof Error ? error : new Error(String(error)),
                );
                return this.createErrorResponse(
                    id,
                    MCPErrorCode.INTERNAL_ERROR,
                    'Internal error',
                    customError,
                );
            } catch (handlerError) {
                this.logger.error(
                    'Error in custom error handler:',
                    handlerError,
                );
            }
        }

        return this.createErrorResponse(
            id,
            MCPErrorCode.INTERNAL_ERROR,
            error instanceof Error ? error.message : 'Internal server error',
        );
    }

    /**
     * Check if server is initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}
