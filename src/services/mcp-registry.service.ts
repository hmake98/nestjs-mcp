import { Injectable, Logger } from '@nestjs/common';
import {
    MCPToolDefinition,
    DiscoveredMCPResource,
    DiscoveredMCPPrompt,
} from '../interfaces';

/**
 * Registry service for managing MCP tools, resources, and prompts
 */
@Injectable()
export class MCPRegistryService {
    private readonly logger = new Logger(MCPRegistryService.name);
    private readonly tools = new Map<string, MCPToolDefinition>();
    private readonly resources = new Map<string, DiscoveredMCPResource>();
    private readonly prompts = new Map<string, DiscoveredMCPPrompt>();

    /**
     * Register a tool
     */
    registerTool(tool: MCPToolDefinition): void {
        if (this.tools.has(tool.name)) {
            this.logger.warn(
                `Tool '${tool.name}' is already registered. Overwriting.`,
            );
        }
        this.tools.set(tool.name, tool);
        this.logger.log(`Registered tool: ${tool.name}`);
    }

    /**
     * Register multiple tools
     */
    registerTools(tools: MCPToolDefinition[]): void {
        tools.forEach((tool) => this.registerTool(tool));
    }

    /**
     * Get a tool by name
     */
    getTool(name: string): MCPToolDefinition | undefined {
        return this.tools.get(name);
    }

    /**
     * Get all registered tools
     */
    getAllTools(): MCPToolDefinition[] {
        return Array.from(this.tools.values());
    }

    /**
     * Check if a tool exists
     */
    hasTool(name: string): boolean {
        return this.tools.has(name);
    }

    /**
     * Unregister a tool
     */
    unregisterTool(name: string): boolean {
        const deleted = this.tools.delete(name);
        if (deleted) {
            this.logger.log(`Unregistered tool: ${name}`);
        }
        return deleted;
    }

    /**
     * Register a resource
     */
    registerResource(resource: DiscoveredMCPResource): void {
        const key = resource.uri || resource.uriTemplate || '';
        if (this.resources.has(key)) {
            this.logger.warn(
                `Resource '${key}' is already registered. Overwriting.`,
            );
        }
        this.resources.set(key, resource);
        this.logger.log(`Registered resource: ${key}`);
    }

    /**
     * Register multiple resources
     */
    registerResources(resources: DiscoveredMCPResource[]): void {
        resources.forEach((resource) => this.registerResource(resource));
    }

    /**
     * Get a resource by URI
     */
    getResource(uri: string): DiscoveredMCPResource | undefined {
        return this.resources.get(uri);
    }

    /**
     * Get all registered resources
     */
    getAllResources(): DiscoveredMCPResource[] {
        return Array.from(this.resources.values());
    }

    /**
     * Check if a resource exists
     */
    hasResource(uri: string): boolean {
        return this.resources.has(uri);
    }

    /**
     * Find resource by URI pattern (for templates)
     */
    findResourceByPattern(uri: string): DiscoveredMCPResource | undefined {
        for (const [_key, resource] of this.resources.entries()) {
            if (
                resource.uriTemplate &&
                this.matchUriTemplate(resource.uriTemplate, uri)
            ) {
                return resource;
            }
        }
        return undefined;
    }

    /**
     * Register a prompt
     */
    registerPrompt(prompt: DiscoveredMCPPrompt): void {
        if (this.prompts.has(prompt.name)) {
            this.logger.warn(
                `Prompt '${prompt.name}' is already registered. Overwriting.`,
            );
        }
        this.prompts.set(prompt.name, prompt);
        this.logger.log(`Registered prompt: ${prompt.name}`);
    }

    /**
     * Register multiple prompts
     */
    registerPrompts(prompts: DiscoveredMCPPrompt[]): void {
        prompts.forEach((prompt) => this.registerPrompt(prompt));
    }

    /**
     * Get a prompt by name
     */
    getPrompt(name: string): DiscoveredMCPPrompt | undefined {
        return this.prompts.get(name);
    }

    /**
     * Get all registered prompts
     */
    getAllPrompts(): DiscoveredMCPPrompt[] {
        return Array.from(this.prompts.values());
    }

    /**
     * Check if a prompt exists
     */
    hasPrompt(name: string): boolean {
        return this.prompts.has(name);
    }

    /**
     * Clear all registrations
     */
    clear(): void {
        this.tools.clear();
        this.resources.clear();
        this.prompts.clear();
        this.logger.log('Cleared all registrations');
    }

    /**
     * Match URI against a URI template
     * Simple implementation - can be enhanced with more sophisticated matching
     */
    private matchUriTemplate(template: string, uri: string): boolean {
        const templateRegex = template.replace(/\{[^}]+\}/g, '([^/]+)');
        const regex = new RegExp(`^${templateRegex}$`);
        return regex.test(uri);
    }

    /**
     * Extract variables from URI using template
     */
    extractUriVariables(template: string, uri: string): Record<string, string> {
        const variables: Record<string, string> = {};
        const templateParts = template.split('/');
        const uriParts = uri.split('/');

        if (templateParts.length !== uriParts.length) {
            return variables;
        }

        templateParts.forEach((part, index) => {
            const match = part.match(/\{([^}]+)\}/);
            if (match) {
                variables[match[1]] = uriParts[index];
            }
        });

        return variables;
    }
}
