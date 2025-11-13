[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-execution.interface](../README.md) / MCPContext

# Interface: MCPContext

Defined in: src/interfaces/mcp-execution.interface.ts:62

MCP-specific context information

## Methods

### getRequest()

> **getRequest**(): [`MCPRequest`](../../mcp-protocol.interface/interfaces/MCPRequest.md)

Defined in: src/interfaces/mcp-execution.interface.ts:66

Get the MCP request

#### Returns

[`MCPRequest`](../../mcp-protocol.interface/interfaces/MCPRequest.md)

***

### getOperationName()

> **getOperationName**(): `string`

Defined in: src/interfaces/mcp-execution.interface.ts:71

Get the operation name (tool/resource/prompt name)

#### Returns

`string`

***

### getType()

> **getType**(): [`MCPContextType`](../enumerations/MCPContextType.md)

Defined in: src/interfaces/mcp-execution.interface.ts:76

Get the operation type

#### Returns

[`MCPContextType`](../enumerations/MCPContextType.md)

***

### getData()

> **getData**\<`T`\>(`key`): `T` \| `undefined`

Defined in: src/interfaces/mcp-execution.interface.ts:81

Get custom data attached to the context

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

#### Returns

`T` \| `undefined`

***

### setData()

> **setData**\<`T`\>(`key`, `value`): `void`

Defined in: src/interfaces/mcp-execution.interface.ts:86

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
