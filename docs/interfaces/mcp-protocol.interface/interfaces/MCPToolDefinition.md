[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-protocol.interface](../README.md) / MCPToolDefinition

# Interface: MCPToolDefinition

Defined in: [src/interfaces/mcp-protocol.interface.ts:61](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L61)

## Properties

### name

> **name**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:62](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L62)

***

### description

> **description**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:63](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L63)

***

### parameters

> **parameters**: [`MCPToolParameter`](MCPToolParameter.md)[]

Defined in: [src/interfaces/mcp-protocol.interface.ts:64](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L64)

***

### handler()

> **handler**: (`params`) => [`JSONValue`](../type-aliases/JSONValue.md) \| `Promise`\<[`JSONValue`](../type-aliases/JSONValue.md)\>

Defined in: [src/interfaces/mcp-protocol.interface.ts:65](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L65)

#### Parameters

##### params

[`JSONObject`](../type-aliases/JSONObject.md)

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md) \| `Promise`\<[`JSONValue`](../type-aliases/JSONValue.md)\>

***

### schema?

> `optional` **schema**: `ZodObject`\<`ZodRawShape`, `UnknownKeysParam`, `ZodTypeAny`, \{\[`key`: `string`\]: `any`; \}, \{\[`key`: `string`\]: `any`; \}\>

Defined in: [src/interfaces/mcp-protocol.interface.ts:70](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L70)

Optional Zod schema for runtime validation
If provided, input will be validated before calling the handler

***

### version?

> `optional` **version**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:74](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L74)

Version of the tool (e.g., '1.0.0', 'v2', '2023-11-01')

***

### deprecated?

> `optional` **deprecated**: `boolean`

Defined in: [src/interfaces/mcp-protocol.interface.ts:78](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L78)

Deprecation status - true if deprecated

***

### deprecationMessage?

> `optional` **deprecationMessage**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:82](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L82)

Deprecation message with migration guidance

***

### guards?

> `optional` **guards**: `unknown`[]

Defined in: [src/interfaces/mcp-protocol.interface.ts:86](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L86)

Guards to apply to this tool

***

### interceptors?

> `optional` **interceptors**: `unknown`[]

Defined in: [src/interfaces/mcp-protocol.interface.ts:90](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L90)

Interceptors to apply to this tool

***

### instance?

> `optional` **instance**: `unknown`

Defined in: [src/interfaces/mcp-protocol.interface.ts:94](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L94)

Handler instance (for context)

***

### methodName?

> `optional` **methodName**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:98](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L98)

Handler method name (for context)
