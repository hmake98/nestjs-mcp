[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [services/mcp-sdk.service](../README.md) / MCPSDKService

# Class: MCPSDKService

Defined in: [src/services/mcp-sdk.service.ts:24](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-sdk.service.ts#L24)

Service that wraps the official MCP SDK McpServer

This service uses the high-level McpServer class which provides a cleaner API
for registering tools, resources, and prompts. The service integrates with
NestJS's dependency injection and discovery mechanisms to automatically
register decorated methods as MCP endpoints.

## Implements

- `OnModuleDestroy`

## Constructors

### Constructor

> **new MCPSDKService**(`options`, `registryService`): `MCPSDKService`

Defined in: [src/services/mcp-sdk.service.ts:30](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-sdk.service.ts#L30)

#### Parameters

##### options

[`MCPModuleOptions`](../../../interfaces/mcp-options.interface/interfaces/MCPModuleOptions.md)

##### registryService

[`MCPRegistryService`](../../mcp-registry.service/classes/MCPRegistryService.md)

#### Returns

`MCPSDKService`

## Methods

### registerDiscoveredItems()

> **registerDiscoveredItems**(): `void`

Defined in: [src/services/mcp-sdk.service.ts:68](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-sdk.service.ts#L68)

Register all discovered tools, resources, and prompts with the MCP server.
This should be called after the discovery phase is complete.

#### Returns

`void`

***

### getServer()

> **getServer**(): `McpServer`

Defined in: [src/services/mcp-sdk.service.ts:292](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-sdk.service.ts#L292)

Get the underlying SDK server instance (low-level access)

#### Returns

`McpServer`

***

### connectStdio()

> **connectStdio**(): `Promise`\<`void`\>

Defined in: [src/services/mcp-sdk.service.ts:299](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-sdk.service.ts#L299)

Connect the server to stdio transport

#### Returns

`Promise`\<`void`\>

***

### onModuleDestroy()

> **onModuleDestroy**(): `Promise`\<`void`\>

Defined in: [src/services/mcp-sdk.service.ts:344](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-sdk.service.ts#L344)

Cleanup on module destroy

#### Returns

`Promise`\<`void`\>

#### Implementation of

`OnModuleDestroy.onModuleDestroy`
