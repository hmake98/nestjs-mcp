[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-cli.interface](../README.md) / ServerIntrospection

# Interface: ServerIntrospection

Defined in: src/interfaces/mcp-cli.interface.ts:19

Server introspection result containing all available tools, resources, and prompts

## Properties

### tools

> **tools**: [`MCPToolDefinition`](../../mcp-protocol.interface/interfaces/MCPToolDefinition.md)[]

Defined in: src/interfaces/mcp-cli.interface.ts:20

***

### resources

> **resources**: [`DiscoveredMCPResource`](../../mcp-protocol.interface/interfaces/DiscoveredMCPResource.md)[]

Defined in: src/interfaces/mcp-cli.interface.ts:21

***

### prompts

> **prompts**: [`DiscoveredMCPPrompt`](../../mcp-protocol.interface/interfaces/DiscoveredMCPPrompt.md)[]

Defined in: src/interfaces/mcp-cli.interface.ts:22

***

### serverInfo

> **serverInfo**: `object`

Defined in: src/interfaces/mcp-cli.interface.ts:23

#### name

> **name**: `string`

#### version

> **version**: `string`
