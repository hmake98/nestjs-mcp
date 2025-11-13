[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-transport.interface](../README.md) / MCPTransportOptions

# Interface: MCPTransportOptions

Defined in: src/interfaces/mcp-transport.interface.ts:41

Transport adapter options base interface

## Extended by

- [`MCPWebSocketOptions`](MCPWebSocketOptions.md)
- [`MCPSseOptions`](MCPSseOptions.md)
- [`MCPRedisOptions`](MCPRedisOptions.md)
- [`MCPGrpcOptions`](MCPGrpcOptions.md)

## Properties

### debug?

> `optional` **debug**: `boolean`

Defined in: src/interfaces/mcp-transport.interface.ts:45

Enable debug logging for the transport

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

***

### maxConnections?

> `optional` **maxConnections**: `number`

Defined in: src/interfaces/mcp-transport.interface.ts:55

Maximum number of concurrent connections (if applicable)

***

### connectionTimeout?

> `optional` **connectionTimeout**: `number`

Defined in: src/interfaces/mcp-transport.interface.ts:60

Connection timeout in milliseconds
