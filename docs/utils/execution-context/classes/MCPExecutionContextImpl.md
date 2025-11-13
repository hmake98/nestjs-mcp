[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [utils/execution-context](../README.md) / MCPExecutionContextImpl

# Class: MCPExecutionContextImpl

Defined in: src/utils/execution-context.ts:45

Implementation of MCPExecutionContext

## Implements

- [`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md)

## Constructors

### Constructor

> **new MCPExecutionContextImpl**(`type`, `request`, `classRef`, `handler`, `args`, `metadata`, `operationName`): `MCPExecutionContextImpl`

Defined in: src/utils/execution-context.ts:48

#### Parameters

##### type

[`MCPContextType`](../../../interfaces/mcp-execution.interface/enumerations/MCPContextType.md)

##### request

[`MCPRequest`](../../../interfaces/mcp-protocol.interface/interfaces/MCPRequest.md)

##### classRef

`Type`\<`unknown`\>

##### handler

`string`

##### args

`unknown`[]

##### metadata

`Record`\<`string`, `unknown`\>

##### operationName

`string`

#### Returns

`MCPExecutionContextImpl`

## Methods

### getType()

> **getType**(): [`MCPContextType`](../../../interfaces/mcp-execution.interface/enumerations/MCPContextType.md)

Defined in: src/utils/execution-context.ts:60

Get the context type (tool, resource, or prompt)

#### Returns

[`MCPContextType`](../../../interfaces/mcp-execution.interface/enumerations/MCPContextType.md)

#### Implementation of

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md).[`getType`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md#gettype)

***

### getRequest()

> **getRequest**(): [`MCPRequest`](../../../interfaces/mcp-protocol.interface/interfaces/MCPRequest.md)

Defined in: src/utils/execution-context.ts:64

Get the MCP request

#### Returns

[`MCPRequest`](../../../interfaces/mcp-protocol.interface/interfaces/MCPRequest.md)

#### Implementation of

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md).[`getRequest`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md#getrequest)

***

### getClass()

> **getClass**(): `Type`\<`unknown`\>

Defined in: src/utils/execution-context.ts:68

Get the handler class instance

#### Returns

`Type`\<`unknown`\>

#### Implementation of

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md).[`getClass`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md#getclass)

***

### getHandler()

> **getHandler**(): `string`

Defined in: src/utils/execution-context.ts:72

Get the handler method name

#### Returns

`string`

#### Implementation of

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md).[`getHandler`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md#gethandler)

***

### getArgs()

> **getArgs**(): `unknown`[]

Defined in: src/utils/execution-context.ts:76

Get handler arguments

#### Returns

`unknown`[]

#### Implementation of

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md).[`getArgs`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md#getargs)

***

### getMetadata()

> **getMetadata**\<`T`\>(`key`): `T` \| `undefined`

Defined in: src/utils/execution-context.ts:80

Get handler metadata by key

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

#### Returns

`T` \| `undefined`

#### Implementation of

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md).[`getMetadata`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md#getmetadata)

***

### getAllMetadata()

> **getAllMetadata**(): `Record`\<`string`, `unknown`\>

Defined in: src/utils/execution-context.ts:84

Get all handler metadata

#### Returns

`Record`\<`string`, `unknown`\>

#### Implementation of

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md).[`getAllMetadata`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md#getallmetadata)

***

### switchToMcp()

> **switchToMcp**(): [`MCPContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md)

Defined in: src/utils/execution-context.ts:88

Switch to MCP context

#### Returns

[`MCPContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPContext.md)

#### Implementation of

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md).[`switchToMcp`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md#switchtomcp)
