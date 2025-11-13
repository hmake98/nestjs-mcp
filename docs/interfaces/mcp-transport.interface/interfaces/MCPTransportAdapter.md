[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-transport.interface](../README.md) / MCPTransportAdapter

# Interface: MCPTransportAdapter

Defined in: src/interfaces/mcp-transport.interface.ts:6

Transport adapter interface for different communication protocols

## Methods

### start()

> **start**(): `Promise`\<`void`\>

Defined in: src/interfaces/mcp-transport.interface.ts:10

Initialize the transport adapter

#### Returns

`Promise`\<`void`\>

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: src/interfaces/mcp-transport.interface.ts:15

Stop the transport adapter and clean up resources

#### Returns

`Promise`\<`void`\>

***

### isRunning()

> **isRunning**(): `boolean`

Defined in: src/interfaces/mcp-transport.interface.ts:20

Check if the transport is currently running

#### Returns

`boolean`

***

### send()

> **send**(`clientId`, `response`): `Promise`\<`void`\>

Defined in: src/interfaces/mcp-transport.interface.ts:25

Send a response through the transport

#### Parameters

##### clientId

`string`

##### response

[`MCPResponse`](../../mcp-protocol.interface/interfaces/MCPResponse.md)

#### Returns

`Promise`\<`void`\>

***

### broadcast()

> **broadcast**(`response`): `Promise`\<`void`\>

Defined in: src/interfaces/mcp-transport.interface.ts:30

Broadcast a message to all connected clients

#### Parameters

##### response

[`MCPResponse`](../../mcp-protocol.interface/interfaces/MCPResponse.md)

#### Returns

`Promise`\<`void`\>

***

### getConnectedClients()

> **getConnectedClients**(): `string`[]

Defined in: src/interfaces/mcp-transport.interface.ts:35

Get the list of connected client IDs

#### Returns

`string`[]
