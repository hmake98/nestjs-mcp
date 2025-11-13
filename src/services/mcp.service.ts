import { Injectable, Logger, Inject } from '@nestjs/common';
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

/**
 * Main MCP service for handling protocol requests
 */
@Injectable()
export class MCPService {
    private readonly logger = new Logger(MCPService.name);
    private initialized = false;

    constructor(
        @Inject(MCP_MODULE_OPTIONS)
        private readonly options: MCPModuleOptions,
        private readonly registryService: MCPRegistryService,
    ) {}

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
                tools: tools.map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: {
                        type: 'object',
                        properties: this.buildParameterSchema(tool.parameters),
                        required: tool.parameters
                            .filter((p) => p.required)
                            .map((p) => p.name),
                    },
                })),
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

        try {
            const result = await tool.handler(args);
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
                resources: resources.map((resource) => ({
                    uri: resource.uri || resource.uriTemplate,
                    name: resource.name,
                    description: resource.description,
                    mimeType: resource.mimeType,
                })),
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

        try {
            const variables = resource.uriTemplate
                ? this.registryService.extractUriVariables(
                      resource.uriTemplate,
                      uri,
                  )
                : {};

            const content = await resource.handler(variables);

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
                prompts: prompts.map((prompt) => ({
                    name: prompt.name,
                    description: prompt.description,
                    arguments: prompt.arguments,
                })),
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

        try {
            const messages = await prompt.handler(args);

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
