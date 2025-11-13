[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [utils/execution-context](../README.md) / MCPContextImpl

# Class: MCPContextImpl

Defined in: src/utils/execution-context.ts:12

Implementation of MCPContext

## Implements

- [`MCPContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md)

## Constructors

### Constructor

> **new MCPContextImpl**(`request`, `operationName`, `type`): `MCPContextImpl`

Defined in: src/utils/execution-context.ts:15

#### Parameters

##### request

[`MCPRequest`](../../../interfaces/mcp-protocol.interface/interfaces/MCPRequest.md)

##### operationName

`string`

##### type

[`MCPContextType`](../../../interfaces/mcp-execution.interface/enumerations/MCPContextType.md)

#### Returns

`MCPContextImpl`

## Methods

### getRequest()

> **getRequest**(): [`MCPRequest`](../../../interfaces/mcp-protocol.interface/interfaces/MCPRequest.md)

Defined in: src/utils/execution-context.ts:21

Get the MCP request

#### Returns

[`MCPRequest`](../../../interfaces/mcp-protocol.interface/interfaces/MCPRequest.md)

#### Implementation of

[`MCPContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md).[`getRequest`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md#getrequest)

***

### getOperationName()

> **getOperationName**(): `string`

Defined in: src/utils/execution-context.ts:25

Get the operation name (tool/resource/prompt name)

#### Returns

`string`

#### Implementation of

[`MCPContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md).[`getOperationName`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md#getoperationname)

***

### getType()

> **getType**(): [`MCPContextType`](../../../interfaces/mcp-execution.interface/enumerations/MCPContextType.md)

Defined in: src/utils/execution-context.ts:29

Get the operation type

#### Returns

[`MCPContextType`](../../../interfaces/mcp-execution.interface/enumerations/MCPContextType.md)

#### Implementation of

[`MCPContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md).[`getType`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md#gettype)

***

### getData()

> **getData**\<`T`\>(`key`): `T` \| `undefined`

Defined in: src/utils/execution-context.ts:33

Get custom data attached to the context

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

#### Returns

`T` \| `undefined`

#### Implementation of

[`MCPContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md).[`getData`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md#getdata)

***

### setData()

> **setData**\<`T`\>(`key`, `value`): `void`

Defined in: src/utils/execution-context.ts:37

Set custom data on the context

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

##### value

`T`

#### Returns

`void`

#### Implementation of

[`MCPContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md).[`setData`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md#setdata)
