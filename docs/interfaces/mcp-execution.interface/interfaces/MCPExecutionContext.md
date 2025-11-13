[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-execution.interface](../README.md) / MCPExecutionContext

# Interface: MCPExecutionContext

Defined in: src/interfaces/mcp-execution.interface.ts:17

Execution context for MCP operations
Provides access to the current request, handler metadata, and execution environment

## Methods

### getType()

> **getType**(): [`MCPContextType`](../enumerations/MCPContextType.md)

Defined in: src/interfaces/mcp-execution.interface.ts:21

Get the context type (tool, resource, or prompt)

#### Returns

[`MCPContextType`](../enumerations/MCPContextType.md)

***

### getRequest()

> **getRequest**(): [`MCPRequest`](../../mcp-protocol.interface/interfaces/MCPRequest.md)

Defined in: src/interfaces/mcp-execution.interface.ts:26

Get the MCP request

#### Returns

[`MCPRequest`](../../mcp-protocol.interface/interfaces/MCPRequest.md)

***

### getClass()

> **getClass**(): `Type`\<`unknown`\>

Defined in: src/interfaces/mcp-execution.interface.ts:31

Get the handler class instance

#### Returns

`Type`\<`unknown`\>

***

### getHandler()

> **getHandler**(): `string`

Defined in: src/interfaces/mcp-execution.interface.ts:36

Get the handler method name

#### Returns

`string`

***

### getArgs()

> **getArgs**(): `unknown`[]

Defined in: src/interfaces/mcp-execution.interface.ts:41

Get handler arguments

#### Returns

`unknown`[]

***

### getMetadata()

> **getMetadata**\<`T`\>(`key`): `T` \| `undefined`

Defined in: src/interfaces/mcp-execution.interface.ts:46

Get handler metadata by key

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

#### Returns

`T` \| `undefined`

***

### getAllMetadata()

> **getAllMetadata**(): `Record`\<`string`, `unknown`\>

Defined in: src/interfaces/mcp-execution.interface.ts:51

Get all handler metadata

#### Returns

`Record`\<`string`, `unknown`\>

***

### switchToMcp()

> **switchToMcp**(): [`MCPContext`](MCPContext.md)

Defined in: src/interfaces/mcp-execution.interface.ts:56

Switch to MCP context

#### Returns

[`MCPContext`](MCPContext.md)
