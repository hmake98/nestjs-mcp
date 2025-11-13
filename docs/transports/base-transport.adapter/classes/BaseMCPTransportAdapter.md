[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [transports/base-transport.adapter](../README.md) / BaseMCPTransportAdapter

# Abstract Class: BaseMCPTransportAdapter

Defined in: src/transports/base-transport.adapter.ts:16

Abstract base class for MCP transport adapters
Provides common functionality for all transport implementations

## Implements

- [`MCPTransportAdapter`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md)
- `OnModuleDestroy`

## Constructors

### Constructor

> **new BaseMCPTransportAdapter**(`mcpService`, `options`): `BaseMCPTransportAdapter`

Defined in: src/transports/base-transport.adapter.ts:23

#### Parameters

##### mcpService

[`MCPService`](../../../services/mcp.service/classes/MCPService.md)

##### options

[`MCPTransportOptions`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportOptions.md)

#### Returns

`BaseMCPTransportAdapter`

## Methods

### start()

> `abstract` **start**(): `Promise`\<`void`\>

Defined in: src/transports/base-transport.adapter.ts:36

Initialize the transport adapter

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MCPTransportAdapter`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md).[`start`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md#start)

***

### stop()

> `abstract` **stop**(): `Promise`\<`void`\>

Defined in: src/transports/base-transport.adapter.ts:41

Stop the transport adapter and clean up resources

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MCPTransportAdapter`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md).[`stop`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md#stop)

***

### send()

> `abstract` **send**(`clientId`, `response`): `Promise`\<`void`\>

Defined in: src/transports/base-transport.adapter.ts:46

Send a response through the transport

#### Parameters

##### clientId

`string`

##### response

[`MCPResponse`](../../../interfaces/mcp-protocol.interface/interfaces/MCPResponse.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MCPTransportAdapter`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md).[`send`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md#send)

***

### broadcast()

> `abstract` **broadcast**(`response`): `Promise`\<`void`\>

Defined in: src/transports/base-transport.adapter.ts:51

Broadcast a message to all connected clients

#### Parameters

##### response

[`MCPResponse`](../../../interfaces/mcp-protocol.interface/interfaces/MCPResponse.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MCPTransportAdapter`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md).[`broadcast`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md#broadcast)

***

### isRunning()

> **isRunning**(): `boolean`

Defined in: src/transports/base-transport.adapter.ts:56

Check if the transport is currently running

#### Returns

`boolean`

#### Implementation of

[`MCPTransportAdapter`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md).[`isRunning`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md#isrunning)

***

### getConnectedClients()

> **getConnectedClients**(): `string`[]

Defined in: src/transports/base-transport.adapter.ts:63

Get the list of connected client IDs

#### Returns

`string`[]

#### Implementation of

[`MCPTransportAdapter`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md).[`getConnectedClients`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportAdapter.md#getconnectedclients)

***

### handleRequest()

> `protected` **handleRequest**(`clientId`, `request`): `Promise`\<[`MCPResponse`](../../../interfaces/mcp-protocol.interface/interfaces/MCPResponse.md)\>

Defined in: src/transports/base-transport.adapter.ts:70

Handle incoming MCP request

#### Parameters

##### clientId

`string`

##### request

[`MCPRequest`](../../../interfaces/mcp-protocol.interface/interfaces/MCPRequest.md)

#### Returns

`Promise`\<[`MCPResponse`](../../../interfaces/mcp-protocol.interface/interfaces/MCPResponse.md)\>

***

### onClientConnect()

> `protected` **onClientConnect**(`clientId`, `client`): `void`

Defined in: src/transports/base-transport.adapter.ts:97

Handle client connection

#### Parameters

##### clientId

`string`

##### client

`unknown`

#### Returns

`void`

***

### onClientDisconnect()

> `protected` **onClientDisconnect**(`clientId`): `void`

Defined in: src/transports/base-transport.adapter.ts:115

Handle client disconnection

#### Parameters

##### clientId

`string`

#### Returns

`void`

***

### generateClientId()

> `protected` **generateClientId**(): `string`

Defined in: src/transports/base-transport.adapter.ts:123

Generate unique client ID

#### Returns

`string`

***

### onModuleDestroy()

> **onModuleDestroy**(): `Promise`\<`void`\>

Defined in: src/transports/base-transport.adapter.ts:130

NestJS lifecycle hook

#### Returns

`Promise`\<`void`\>

#### Implementation of

`OnModuleDestroy.onModuleDestroy`

## Properties

### logger

> `protected` **logger**: [`MCPLogger`](../../../utils/logger/classes/MCPLogger.md)

Defined in: src/transports/base-transport.adapter.ts:19

***

### running

> `protected` **running**: `boolean` = `false`

Defined in: src/transports/base-transport.adapter.ts:20

***

### clients

> `protected` **clients**: `Map`\<`string`, `unknown`\>

Defined in: src/transports/base-transport.adapter.ts:21

***

### mcpService

> `protected` `readonly` **mcpService**: [`MCPService`](../../../services/mcp.service/classes/MCPService.md)

Defined in: src/transports/base-transport.adapter.ts:24

***

### options

> `protected` `readonly` **options**: [`MCPTransportOptions`](../../../interfaces/mcp-transport.interface/interfaces/MCPTransportOptions.md)

Defined in: src/transports/base-transport.adapter.ts:25
