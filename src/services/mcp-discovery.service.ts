import { Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
  MCP_TOOL_METADATA,
  MCP_RESOURCE_METADATA,
  MCP_PROMPT_METADATA,
  MCP_TOOL_PARAM_METADATA,
} from '../constants';
import {
  MCPToolDefinition,
  MCPToolParameter,
  DiscoveredMCPResource,
  DiscoveredMCPPrompt,
} from '../interfaces';

/**
 * Service responsible for discovering MCP tools, resources, and prompts
 * from providers decorated with MCP decorators
 */
@Injectable()
export class MCPDiscoveryService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Discover all MCP tools from providers
   */
  discoverTools(): MCPToolDefinition[] {
    const tools: MCPToolDefinition[] = [];
    const providers = this.discoveryService.getProviders();

    providers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (!instance || typeof instance !== 'object') {
        return;
      }

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      methodNames.forEach((methodName) => {
        const toolMetadata = this.reflector.get(
          MCP_TOOL_METADATA,
          instance[methodName],
        );

        if (toolMetadata) {
          const paramMetadata =
            this.reflector.get(MCP_TOOL_PARAM_METADATA, instance[methodName]) ||
            [];

          const method = instance[methodName].bind(instance);

          tools.push({
            name: toolMetadata.name,
            description: toolMetadata.description,
            parameters: this.extractParameters(method, paramMetadata),
            handler: method,
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
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      methodNames.forEach((methodName) => {
        const resourceMetadata = this.reflector.get(
          MCP_RESOURCE_METADATA,
          instance[methodName],
        );

        if (resourceMetadata) {
          const method = instance[methodName].bind(instance);
          resources.push({
            ...resourceMetadata,
            handler: method,
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
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      methodNames.forEach((methodName) => {
        const promptMetadata = this.reflector.get(
          MCP_PROMPT_METADATA,
          instance[methodName],
        );

        if (promptMetadata) {
          const method = instance[methodName].bind(instance);
          prompts.push({
            ...promptMetadata,
            handler: method,
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
}
