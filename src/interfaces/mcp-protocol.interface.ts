/**
 * Core MCP Protocol interfaces based on the Model Context Protocol specification
 */

import { z } from 'zod';

/**
 * Generic JSON value type
 */
export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [key: string]: JSONValue };

/**
 * Generic JSON object type
 */
export type JSONObject = { [key: string]: JSONValue };

export interface MCPRequest<P = JSONObject> {
    jsonrpc: '2.0';
    id: string | number;
    method: string;
    params?: P;
}

export interface MCPResponse {
    jsonrpc: '2.0';
    id: string | number;
    result?: unknown;
    error?: MCPError;
}

export interface MCPError {
    code: number;
    message: string;
    data?: JSONValue;
}

export interface MCPNotification {
    jsonrpc: '2.0';
    method: string;
    params?: JSONObject;
}

/**
 * MCP Tool interfaces
 */
export interface MCPToolParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description?: string;
    required?: boolean;
    default?: JSONValue;
    enum?: JSONValue[];
}

export interface MCPToolDefinition {
    name: string;
    description: string;
    parameters: MCPToolParameter[];
    handler: (params: JSONObject) => Promise<JSONValue> | JSONValue;
    /**
     * Optional Zod schema for runtime validation
     * If provided, input will be validated before calling the handler
     */
    schema?: z.ZodObject<z.ZodRawShape>;
}

export interface MCPToolResult {
    content: Array<{
        type: 'text' | 'image' | 'resource';
        text?: string;
        data?: string;
        mimeType?: string;
    }>;
    isError?: boolean;
}

/**
 * MCP Resource interfaces
 */
export interface MCPResourceInfo {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}

export interface MCPResourceContent {
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
}

export interface MCPResourceTemplateInfo {
    uriTemplate: string;
    name: string;
    description?: string;
    mimeType?: string;
}

/**
 * MCP Prompt interfaces
 */
export interface MCPPromptInfo {
    name: string;
    description?: string;
    arguments?: Array<{
        name: string;
        description?: string;
        required?: boolean;
    }>;
}

export interface MCPPromptMessage {
    role: 'user' | 'assistant';
    content: {
        type: 'text' | 'image' | 'resource';
        text?: string;
        data?: string;
        mimeType?: string;
    };
}

/**
 * MCP Server capabilities
 */
export interface MCPServerCapabilities {
    [x: string]: unknown;
    tools?: {
        listChanged?: boolean;
    };
    resources?: {
        subscribe?: boolean;
        listChanged?: boolean;
    };
    prompts?: {
        listChanged?: boolean;
    };
    logging?: JSONObject;
    experimental?: JSONObject;
    completions?: JSONObject;
}

/**
 * MCP Server info
 */
export interface MCPServerInfo {
    name: string;
    version: string;
    capabilities?: MCPServerCapabilities;
}

/**
 * MCP Client info
 */
export interface MCPClientInfo {
    name: string;
    version: string;
}

/**
 * Initialize request/response
 */
export interface MCPInitializeRequest
    extends MCPRequest<{
        protocolVersion: string;
        capabilities: JSONObject;
        clientInfo: MCPClientInfo;
    }> {
    method: 'initialize';
}

export interface MCPInitializeResponse extends MCPResponse {
    result: {
        protocolVersion: string;
        capabilities: MCPServerCapabilities;
        serverInfo: MCPServerInfo;
    };
}

/**
 * Discovered MCP resource with handler
 */
export interface DiscoveredMCPResource {
    uri?: string;
    uriTemplate?: string;
    name: string;
    description?: string;
    mimeType?: string;
    isTemplate?: boolean;
    handler: (
        variables?: Record<string, string>,
    ) => Promise<JSONValue> | JSONValue;
    /**
     * Optional Zod schema for runtime validation of URI template variables
     */
    schema?: z.ZodObject<z.ZodRawShape>;
}

/**
 * Discovered MCP prompt with handler
 */
export interface DiscoveredMCPPrompt {
    name: string;
    description?: string;
    arguments?: Array<{
        name: string;
        description?: string;
        required?: boolean;
    }>;
    handler: (args: JSONObject) => Promise<JSONValue> | JSONValue;
    /**
     * Optional Zod schema for runtime validation of prompt arguments
     */
    schema?: z.ZodObject<z.ZodRawShape>;
}
