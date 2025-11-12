import { Injectable, Logger, Inject, OnModuleDestroy } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  MCPModuleOptions,
  MCPToolParameter,
  JSONValue,
  JSONObject,
} from '../interfaces';
import { MCP_MODULE_OPTIONS } from '../constants';
import { MCPRegistryService } from './mcp-registry.service';

/**
 * Service that wraps the official MCP SDK McpServer
 *
 * This service uses the high-level McpServer class which provides a cleaner API
 * for registering tools, resources, and prompts. The service integrates with
 * NestJS's dependency injection and discovery mechanisms to automatically
 * register decorated methods as MCP endpoints.
 */
@Injectable()
export class MCPSDKService implements OnModuleDestroy {
  private readonly logger = new Logger(MCPSDKService.name);
  private mcpServer: McpServer;
  private transport?: StdioServerTransport;
  private isRegistered = false;

  constructor(
    @Inject(MCP_MODULE_OPTIONS)
    private readonly options: MCPModuleOptions,
    private readonly registryService: MCPRegistryService,
  ) {
    this.initializeServer();
  }

  /**
   * Initialize the MCP SDK server
   */
  private initializeServer(): void {
    this.mcpServer = new McpServer(
      {
        name: this.options.serverInfo.name,
        version: this.options.serverInfo.version,
      },
      {
        capabilities: this.options.serverInfo.capabilities || {
          tools: {},
          resources: {},
          prompts: {},
        },
      },
    );

    this.logger.log('MCP SDK server initialized');
  }

  /**
   * Register all discovered tools, resources, and prompts with the MCP server.
   * This should be called after the discovery phase is complete.
   */
  registerDiscoveredItems(): void {
    if (this.isRegistered) {
      this.logger.warn('Items already registered, skipping');
      return;
    }

    this.registerAllTools();
    this.registerAllResources();
    this.registerAllPrompts();

    this.isRegistered = true;
    this.logger.log('All discovered items registered with MCP server');
  }

  /**
   * Register all tools from the registry with the MCP server
   */
  private registerAllTools(): void {
    const tools = this.registryService.getAllTools();

    for (const tool of tools) {
      const inputSchema = this.buildZodSchemaFromParameters(tool.parameters);

      this.mcpServer.registerTool(
        tool.name,
        {
          description: tool.description,
          inputSchema,
        },
        async (args, _extra) => {
          try {
            const result = await tool.handler((args as JSONObject) || {});
            return this.normalizeToolResult(result);
          } catch (error) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
              ],
              isError: true,
            };
          }
        },
      );

      this.logger.debug(`Registered tool: ${tool.name}`);
    }
  }

  /**
   * Register all resources from the registry with the MCP server
   */
  private registerAllResources(): void {
    const resources = this.registryService.getAllResources();

    for (const resource of resources) {
      if (resource.uri) {
        // Static resource
        this.mcpServer.registerResource(
          resource.name,
          resource.uri,
          {
            description: resource.description,
            mimeType: resource.mimeType,
          },
          async (_uri, _extra) => {
            const content = await resource.handler({});
            const contentArray = Array.isArray(content) ? content : [content];
            // Cast to SDK expected format - actual validation happens at runtime
            return {
              contents: contentArray,
            } as {
              contents: Array<{
                [x: string]: unknown;
                uri: string;
                text: string;
                mimeType?: string;
              }>;
            };
          },
        );

        this.logger.debug(`Registered static resource: ${resource.name}`);
      } else if (resource.uriTemplate) {
        // Template resource - for now we'll register with a simple handler
        // Note: Full template support would require ResourceTemplate class
        this.logger.warn(
          `Template resources not fully supported yet: ${resource.name}`,
        );
      }
    }
  }

  /**
   * Register all prompts from the registry with the MCP server
   */
  private registerAllPrompts(): void {
    const prompts = this.registryService.getAllPrompts();

    for (const prompt of prompts) {
      const argsSchema = prompt.arguments
        ? this.buildZodSchemaFromPromptArgs(prompt.arguments)
        : undefined;

      this.mcpServer.registerPrompt(
        prompt.name,
        {
          description: prompt.description,
          argsSchema,
        },
        async (args, _extra) => {
          const messages = await prompt.handler((args as JSONObject) || {});
          const messageArray = Array.isArray(messages) ? messages : [messages];
          // Cast to SDK expected format - actual validation happens at runtime
          return {
            messages: messageArray,
          } as {
            messages: Array<{
              [x: string]: unknown;
              role: 'user' | 'assistant';
              content: {
                type: 'text';
                text: string;
              };
            }>;
          };
        },
      );

      this.logger.debug(`Registered prompt: ${prompt.name}`);
    }
  }

  /**
   * Build Zod schema from tool parameters
   */
  private buildZodSchemaFromParameters(
    parameters: MCPToolParameter[],
  ): z.ZodRawShape {
    const schema: z.ZodRawShape = {};

    parameters.forEach((param) => {
      let zodType: z.ZodTypeAny;

      switch (param.type) {
        case 'string':
          zodType = z.string();
          break;
        case 'number':
          zodType = z.number();
          break;
        case 'boolean':
          zodType = z.boolean();
          break;
        case 'array':
          zodType = z.array(z.any());
          break;
        case 'object':
          zodType = z.object({}).passthrough();
          break;
        default:
          zodType = z.any();
      }

      if (param.description) {
        zodType = zodType.describe(param.description);
      }

      if (!param.required) {
        zodType = zodType.optional();
      }

      if (param.default !== undefined) {
        zodType = zodType.default(param.default);
      }

      schema[param.name] = zodType;
    });

    return schema;
  }

  /**
   * Build Zod schema from prompt arguments
   */
  private buildZodSchemaFromPromptArgs(
    args: Array<{ name: string; description?: string; required?: boolean }>,
  ): z.ZodRawShape {
    const schema: z.ZodRawShape = {};

    args.forEach((arg) => {
      let zodType: z.ZodTypeAny = z.string();

      if (arg.description) {
        zodType = zodType.describe(arg.description);
      }

      if (!arg.required) {
        zodType = zodType.optional();
      }

      schema[arg.name] = zodType;
    });

    return schema;
  }

  /**
   * Get the underlying SDK server instance (low-level access)
   */
  getServer(): McpServer {
    return this.mcpServer;
  }

  /**
   * Connect the server to stdio transport
   */
  async connectStdio(): Promise<void> {
    // First, register all discovered items
    this.registerDiscoveredItems();

    // Then connect to the transport
    this.transport = new StdioServerTransport();
    await this.mcpServer.connect(this.transport);
    this.logger.log('MCP server connected to stdio transport');
  }

  /**
   * Normalize tool result to match SDK expectations
   */
  private normalizeToolResult(result: JSONValue): {
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  } {
    if (
      result &&
      typeof result === 'object' &&
      !Array.isArray(result) &&
      'content' in result
    ) {
      return result as {
        content: Array<{ type: 'text'; text: string }>;
        isError?: boolean;
      };
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: typeof result === 'string' ? result : JSON.stringify(result),
        },
      ],
    };
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy() {
    if (this.transport) {
      await this.mcpServer.close();
      this.logger.log('MCP server closed');
    }
  }
}
