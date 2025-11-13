[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-transport.interface](../README.md) / MCPGrpcOptions

# Interface: MCPGrpcOptions

Defined in: src/interfaces/mcp-transport.interface.ts:163

gRPC transport options

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

Defined in: src/interfaces/mcp-transport.interface.ts:167

Port to listen on

***

### host?

> `optional` **host**: `string`

Defined in: src/interfaces/mcp-transport.interface.ts:172

Host to bind to

***

### protoPath?

> `optional` **protoPath**: `string`

Defined in: src/interfaces/mcp-transport.interface.ts:177

Path to proto file

***

### packageName?

> `optional` **packageName**: `string`

Defined in: src/interfaces/mcp-transport.interface.ts:182

gRPC package name

***

### serviceName?

> `optional` **serviceName**: `string`

Defined in: src/interfaces/mcp-transport.interface.ts:187

gRPC service name

***

### secure?

> `optional` **secure**: `boolean`

Defined in: src/interfaces/mcp-transport.interface.ts:192

Enable TLS/SSL

***

### credentials?

> `optional` **credentials**: `object`

Defined in: src/interfaces/mcp-transport.interface.ts:197

Server credentials options

#### rootCerts?

> `optional` **rootCerts**: `Uint8Array`\<`ArrayBufferLike`\>

#### privateKey?

> `optional` **privateKey**: `Uint8Array`\<`ArrayBufferLike`\>

#### certChain?

> `optional` **certChain**: `Uint8Array`\<`ArrayBufferLike`\>
