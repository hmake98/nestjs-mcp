[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-transport.interface](../README.md) / MCPRedisOptions

# Interface: MCPRedisOptions

Defined in: src/interfaces/mcp-transport.interface.ts:116

Redis transport options

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

### host?

> `optional` **host**: `string`

Defined in: src/interfaces/mcp-transport.interface.ts:120

Redis connection host

***

### port?

> `optional` **port**: `number`

Defined in: src/interfaces/mcp-transport.interface.ts:125

Redis connection port

***

### password?

> `optional` **password**: `string`

Defined in: src/interfaces/mcp-transport.interface.ts:130

Redis password

***

### db?

> `optional` **db**: `number`

Defined in: src/interfaces/mcp-transport.interface.ts:135

Redis database number

***

### channelPrefix?

> `optional` **channelPrefix**: `string`

Defined in: src/interfaces/mcp-transport.interface.ts:140

Channel prefix for pub/sub

***

### requestChannel?

> `optional` **requestChannel**: `string`

Defined in: src/interfaces/mcp-transport.interface.ts:145

Request channel name

***

### responseChannel?

> `optional` **responseChannel**: `string`

Defined in: src/interfaces/mcp-transport.interface.ts:150

Response channel name pattern

***

### redisOptions?

> `optional` **redisOptions**: `object`

Defined in: src/interfaces/mcp-transport.interface.ts:155

Redis connection options (for ioredis)

#### Index Signature

\[`key`: `string`\]: `unknown`
