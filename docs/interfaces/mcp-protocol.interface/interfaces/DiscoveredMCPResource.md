[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-protocol.interface](../README.md) / DiscoveredMCPResource

# Interface: DiscoveredMCPResource

Defined in: [src/interfaces/mcp-protocol.interface.ts:254](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L254)

Discovered MCP resource with handler

## Properties

### uri?

> `optional` **uri**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:255](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L255)

***

### uriTemplate?

> `optional` **uriTemplate**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:256](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L256)

***

### name

> **name**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:257](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L257)

***

### description?

> `optional` **description**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:258](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L258)

***

### mimeType?

> `optional` **mimeType**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:259](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L259)

***

### isTemplate?

> `optional` **isTemplate**: `boolean`

Defined in: [src/interfaces/mcp-protocol.interface.ts:260](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L260)

***

### handler()

> **handler**: (`variables?`) => [`JSONValue`](../type-aliases/JSONValue.md) \| `Promise`\<[`JSONValue`](../type-aliases/JSONValue.md)\>

Defined in: [src/interfaces/mcp-protocol.interface.ts:261](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L261)

#### Parameters

##### variables?

`Record`\<`string`, `string`\>

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md) \| `Promise`\<[`JSONValue`](../type-aliases/JSONValue.md)\>

***

### schema?

> `optional` **schema**: `ZodObject`\<`ZodRawShape`, `UnknownKeysParam`, `ZodTypeAny`, \{\[`key`: `string`\]: `any`; \}, \{\[`key`: `string`\]: `any`; \}\>

Defined in: [src/interfaces/mcp-protocol.interface.ts:267](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L267)

Optional Zod schema for runtime validation of URI template variables

***

### version?

> `optional` **version**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:271](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L271)

Version of the resource (e.g., '1.0.0', 'v2', '2023-11-01')

***

### deprecated?

> `optional` **deprecated**: `boolean`

Defined in: [src/interfaces/mcp-protocol.interface.ts:275](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L275)

Deprecation status - true if deprecated

***

### deprecationMessage?

> `optional` **deprecationMessage**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:279](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L279)

Deprecation message with migration guidance

***

### guards?

> `optional` **guards**: `unknown`[]

Defined in: [src/interfaces/mcp-protocol.interface.ts:283](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L283)

Guards to apply to this resource

***

### interceptors?

> `optional` **interceptors**: `unknown`[]

Defined in: [src/interfaces/mcp-protocol.interface.ts:287](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L287)

Interceptors to apply to this resource

***

### instance?

> `optional` **instance**: `unknown`

Defined in: [src/interfaces/mcp-protocol.interface.ts:291](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L291)

Handler instance (for context)

***

### methodName?

> `optional` **methodName**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:295](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L295)

Handler method name (for context)
