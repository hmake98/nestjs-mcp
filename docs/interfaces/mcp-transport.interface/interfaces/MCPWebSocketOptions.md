[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-transport.interface](../README.md) / MCPWebSocketOptions

# Interface: MCPWebSocketOptions

Defined in: src/interfaces/mcp-transport.interface.ts:66

WebSocket transport options

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

### port?

> `optional` **port**: `number`

Defined in: src/interfaces/mcp-transport.interface.ts:70

Port to listen on

***

### host?

> `optional` **host**: `string`

Defined in: src/interfaces/mcp-transport.interface.ts:75

Host to bind to

***

### path?

> `optional` **path**: `string`

Defined in: src/interfaces/mcp-transport.interface.ts:80

Path for WebSocket endpoint

***

### perMessageDeflate?

> `optional` **perMessageDeflate**: `boolean`

Defined in: src/interfaces/mcp-transport.interface.ts:85

Enable per-message deflate compression

***

### maxPayload?

> `optional` **maxPayload**: `number`

Defined in: src/interfaces/mcp-transport.interface.ts:90

Maximum payload size in bytes
