[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-resource.interface](../README.md) / MCPResourceTemplateMetadata

# Interface: MCPResourceTemplateMetadata

Defined in: [src/interfaces/mcp-resource.interface.ts:30](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L30)

Metadata for MCP resource template

## Properties

### uriTemplate

> **uriTemplate**: `string`

Defined in: [src/interfaces/mcp-resource.interface.ts:31](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L31)

***

### name

> **name**: `string`

Defined in: [src/interfaces/mcp-resource.interface.ts:32](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L32)

***

### description?

> `optional` **description**: `string`

Defined in: [src/interfaces/mcp-resource.interface.ts:33](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L33)

***

### mimeType?

> `optional` **mimeType**: `string`

Defined in: [src/interfaces/mcp-resource.interface.ts:34](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L34)

***

### schema?

> `optional` **schema**: `ZodObject`\<`ZodRawShape`, `UnknownKeysParam`, `ZodTypeAny`, \{\[`key`: `string`\]: `any`; \}, \{\[`key`: `string`\]: `any`; \}\>

Defined in: [src/interfaces/mcp-resource.interface.ts:39](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L39)

Zod schema for validating URI template variables
This ensures that extracted variables from the URI match expected types

***

### version?

> `optional` **version**: `string`

Defined in: [src/interfaces/mcp-resource.interface.ts:43](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L43)

Version of the resource template (e.g., '1.0.0', 'v2', '2023-11-01')

***

### deprecation?

> `optional` **deprecation**: [`DeprecationInfo`](../../mcp-tool.interface/interfaces/DeprecationInfo.md)

Defined in: [src/interfaces/mcp-resource.interface.ts:47](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L47)

Deprecation information
