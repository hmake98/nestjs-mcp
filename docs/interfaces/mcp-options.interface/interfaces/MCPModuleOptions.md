[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-options.interface](../README.md) / MCPModuleOptions

# Interface: MCPModuleOptions

Defined in: [src/interfaces/mcp-options.interface.ts:9](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L9)

Options for configuring the MCP module

## Properties

### serverInfo

> **serverInfo**: [`MCPServerInfo`](../../mcp-protocol.interface/interfaces/MCPServerInfo.md)

Defined in: [src/interfaces/mcp-options.interface.ts:13](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L13)

Server information

***

### autoDiscoverTools?

> `optional` **autoDiscoverTools**: `boolean`

Defined in: [src/interfaces/mcp-options.interface.ts:18](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L18)

Enable automatic tool discovery from providers

***

### autoDiscoverResources?

> `optional` **autoDiscoverResources**: `boolean`

Defined in: [src/interfaces/mcp-options.interface.ts:23](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L23)

Enable automatic resource discovery from providers

***

### autoDiscoverPrompts?

> `optional` **autoDiscoverPrompts**: `boolean`

Defined in: [src/interfaces/mcp-options.interface.ts:28](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L28)

Enable automatic prompt discovery from providers

***

### globalPrefix?

> `optional` **globalPrefix**: `string`

Defined in: [src/interfaces/mcp-options.interface.ts:33](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L33)

Global prefix for all MCP endpoints

***

### ~~enableLogging?~~

> `optional` **enableLogging**: `boolean`

Defined in: [src/interfaces/mcp-options.interface.ts:39](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L39)

Enable request/response logging

#### Deprecated

Use logLevel instead for more granular control

***

### logLevel?

> `optional` **logLevel**: [`LogLevelName`](../../mcp-logger.interface/type-aliases/LogLevelName.md) \| [`LogLevel`](../../mcp-logger.interface/enumerations/LogLevel.md)

Defined in: [src/interfaces/mcp-options.interface.ts:46](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L46)

Set the log level for the MCP module
Levels: 'error' | 'warn' | 'info' | 'debug' | 'verbose'
Default: 'info'

***

### errorHandler()?

> `optional` **errorHandler**: (`error`) => [`JSONValue`](../../mcp-protocol.interface/type-aliases/JSONValue.md)

Defined in: [src/interfaces/mcp-options.interface.ts:51](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L51)

Custom error handler

#### Parameters

##### error

`Error`

#### Returns

[`JSONValue`](../../mcp-protocol.interface/type-aliases/JSONValue.md)

***

### transports?

> `optional` **transports**: [`MCPTransportConfig`](../../mcp-transport.interface/interfaces/MCPTransportConfig.md)[]

Defined in: [src/interfaces/mcp-options.interface.ts:58](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L58)

Transport configurations
Can enable multiple transports simultaneously (HTTP, WebSocket, SSE, Redis, gRPC)
HTTP transport is always enabled by default via the controller
