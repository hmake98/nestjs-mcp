[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-protocol.interface](../README.md) / DiscoveredMCPPrompt

# Interface: DiscoveredMCPPrompt

Defined in: [src/interfaces/mcp-protocol.interface.ts:301](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L301)

Discovered MCP prompt with handler

## Properties

### name

> **name**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:302](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L302)

***

### description?

> `optional` **description**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:303](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L303)

***

### arguments?

> `optional` **arguments**: `object`[]

Defined in: [src/interfaces/mcp-protocol.interface.ts:304](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L304)

#### name

> **name**: `string`

#### description?

> `optional` **description**: `string`

#### required?

> `optional` **required**: `boolean`

***

### handler()

> **handler**: (`args`) => [`JSONValue`](../type-aliases/JSONValue.md) \| `Promise`\<[`JSONValue`](../type-aliases/JSONValue.md)\>

Defined in: [src/interfaces/mcp-protocol.interface.ts:309](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L309)

#### Parameters

##### args

[`JSONObject`](../type-aliases/JSONObject.md)

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md) \| `Promise`\<[`JSONValue`](../type-aliases/JSONValue.md)\>

***

### schema?

> `optional` **schema**: `ZodObject`\<`ZodRawShape`, `UnknownKeysParam`, `ZodTypeAny`, \{\[`key`: `string`\]: `any`; \}, \{\[`key`: `string`\]: `any`; \}\>

Defined in: [src/interfaces/mcp-protocol.interface.ts:313](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L313)

Optional Zod schema for runtime validation of prompt arguments

***

### version?

> `optional` **version**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:317](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L317)

Version of the prompt (e.g., '1.0.0', 'v2', '2023-11-01')

***

### deprecated?

> `optional` **deprecated**: `boolean`

Defined in: [src/interfaces/mcp-protocol.interface.ts:321](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L321)

Deprecation status - true if deprecated

***

### deprecationMessage?

> `optional` **deprecationMessage**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:325](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L325)

Deprecation message with migration guidance

***

### guards?

> `optional` **guards**: `unknown`[]

Defined in: [src/interfaces/mcp-protocol.interface.ts:329](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L329)

Guards to apply to this prompt

***

### interceptors?

> `optional` **interceptors**: `unknown`[]

Defined in: [src/interfaces/mcp-protocol.interface.ts:333](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L333)

Interceptors to apply to this prompt

***

### instance?

> `optional` **instance**: `unknown`

Defined in: [src/interfaces/mcp-protocol.interface.ts:337](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L337)

Handler instance (for context)

***

### methodName?

> `optional` **methodName**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:341](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L341)

Handler method name (for context)
