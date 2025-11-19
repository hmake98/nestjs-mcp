/**
 * MCP Constants and metadata keys
 */

export const MCP_MODULE_OPTIONS = 'MCP_MODULE_OPTIONS';

export const MCP_TOOL_METADATA = 'mcp:tool';
export const MCP_RESOURCE_METADATA = 'mcp:resource';
export const MCP_PROMPT_METADATA = 'mcp:prompt';
export const MCP_TOOL_PARAM_METADATA = 'mcp:tool:param';
export const MCP_GUARDS_METADATA = 'mcp:guards';
export const MCP_INTERCEPTORS_METADATA = 'mcp:interceptors';
export const MCP_PUBLIC_KEY = 'mcp:isPublic';

/**
 * MCP Protocol version
 */
export const MCP_PROTOCOL_VERSION = '2024-11-05';

/**
 * MCP Error codes
 */
export enum MCPErrorCode {
    PARSE_ERROR = -32700,
    INVALID_REQUEST = -32600,
    METHOD_NOT_FOUND = -32601,
    INVALID_PARAMS = -32602,
    INTERNAL_ERROR = -32603,
    SERVER_ERROR = -32000,
}

/**
 * MCP Methods
 */
export enum MCPMethod {
    INITIALIZE = 'initialize',
    INITIALIZED = 'initialized',
    PING = 'ping',
    TOOLS_LIST = 'tools/list',
    TOOLS_CALL = 'tools/call',
    RESOURCES_LIST = 'resources/list',
    RESOURCES_READ = 'resources/read',
    RESOURCES_SUBSCRIBE = 'resources/subscribe',
    RESOURCES_UNSUBSCRIBE = 'resources/unsubscribe',
    PROMPTS_LIST = 'prompts/list',
    PROMPTS_GET = 'prompts/get',
    LOGGING_SET_LEVEL = 'logging/setLevel',
}
