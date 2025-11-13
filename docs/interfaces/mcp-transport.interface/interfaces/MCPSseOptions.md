[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-transport.interface](../README.md) / MCPSseOptions

# Interface: MCPSseOptions

Defined in: src/interfaces/mcp-transport.interface.ts:96

Server-Sent Events transport options

## Extends

- [`MCPTransportOptions`](MCPTransportOptions.md)

## Properties

### debug?

> `optional` **debug**: `boolean`

Defined in: src/interfaces/mcp-transport.interface.ts:45

Enable debug logging for the transport

#### Inherited from

[`MCPTransportOptions`](MCPTransportOptions.md).[`debug`](MCPTransportOptions.md#debug)

***

### errorHandler()?

> `optional` **errorHandler**: (`error`, `clientId?`) => `void`

Defined in: src/interfaces/mcp-transport.interface.ts:50

Custom error handler

#### Parameters

##### error

`Error`

##### clientId?

`string`

#### Returns

`void`

#### Inherited from

[`MCPTransportOptions`](MCPTransportOptions.md).[`errorHandler`](MCPTransportOptions.md#errorhandler)

***

### maxConnections?

> `optional` **maxConnections**: `number`

Defined in: src/interfaces/mcp-transport.interface.ts:55

Maximum number of concurrent connections (if applicable)

#### Inherited from

[`MCPTransportOptions`](MCPTransportOptions.md).[`maxConnections`](MCPTransportOptions.md#maxconnections)

***

### connectionTimeout?

> `optional` **connectionTimeout**: `number`

Defined in: src/interfaces/mcp-transport.interface.ts:60

Connection timeout in milliseconds

#### Inherited from

[`MCPTransportOptions`](MCPTransportOptions.md).[`connectionTimeout`](MCPTransportOptions.md#connectiontimeout)

***

### path?

> `optional` **path**: `string`

Defined in: src/interfaces/mcp-transport.interface.ts:100

Endpoint path for SSE connections

***

### heartbeatInterval?

> `optional` **heartbeatInterval**: `number`

Defined in: src/interfaces/mcp-transport.interface.ts:105

Heartbeat interval in milliseconds

***

### retryInterval?

> `optional` **retryInterval**: `number`

Defined in: src/interfaces/mcp-transport.interface.ts:110

Retry interval sent to clients (milliseconds)
