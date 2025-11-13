[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-prompt.interface](../README.md) / MCPPromptMetadata

# Interface: MCPPromptMetadata

Defined in: [src/interfaces/mcp-prompt.interface.ts:7](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-prompt.interface.ts#L7)

Metadata for MCP prompt

## Properties

### name

> **name**: `string`

Defined in: [src/interfaces/mcp-prompt.interface.ts:8](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-prompt.interface.ts#L8)

***

### description?

> `optional` **description**: `string`

Defined in: [src/interfaces/mcp-prompt.interface.ts:9](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-prompt.interface.ts#L9)

***

### arguments?

> `optional` **arguments**: `object`[]

Defined in: [src/interfaces/mcp-prompt.interface.ts:14](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-prompt.interface.ts#L14)

Manual argument definitions (legacy approach)
Use 'schema' instead for Zod-based validation

#### name

> **name**: `string`

#### description?

> `optional` **description**: `string`

#### required?

> `optional` **required**: `boolean`

***

### schema?

> `optional` **schema**: `ZodObject`\<`ZodRawShape`, `UnknownKeysParam`, `ZodTypeAny`, \{\[`key`: `string`\]: `any`; \}, \{\[`key`: `string`\]: `any`; \}\>

Defined in: [src/interfaces/mcp-prompt.interface.ts:23](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-prompt.interface.ts#L23)

Zod schema for validating prompt arguments
Preferred over 'arguments' for type-safe validation

***

### version?

> `optional` **version**: `string`

Defined in: [src/interfaces/mcp-prompt.interface.ts:27](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-prompt.interface.ts#L27)

Version of the prompt (e.g., '1.0.0', 'v2', '2023-11-01')

***

### deprecation?

> `optional` **deprecation**: [`DeprecationInfo`](../../mcp-tool.interface/interfaces/DeprecationInfo.md)

Defined in: [src/interfaces/mcp-prompt.interface.ts:31](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-prompt.interface.ts#L31)

Deprecation information
