[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-resource.interface](../README.md) / MCPResourceMetadata

# Interface: MCPResourceMetadata

Defined in: [src/interfaces/mcp-resource.interface.ts:7](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L7)

Metadata for MCP resource

## Properties

### uri

> **uri**: `string`

Defined in: [src/interfaces/mcp-resource.interface.ts:8](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L8)

***

### name

> **name**: `string`

Defined in: [src/interfaces/mcp-resource.interface.ts:9](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L9)

***

### description?

> `optional` **description**: `string`

Defined in: [src/interfaces/mcp-resource.interface.ts:10](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L10)

***

### mimeType?

> `optional` **mimeType**: `string`

Defined in: [src/interfaces/mcp-resource.interface.ts:11](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L11)

***

### schema?

> `optional` **schema**: `ZodObject`\<`ZodRawShape`, `UnknownKeysParam`, `ZodTypeAny`, \{\[`key`: `string`\]: `any`; \}, \{\[`key`: `string`\]: `any`; \}\>

Defined in: [src/interfaces/mcp-resource.interface.ts:16](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L16)

Zod schema for validating resource read parameters
Use this for static resources that may accept query parameters

***

### version?

> `optional` **version**: `string`

Defined in: [src/interfaces/mcp-resource.interface.ts:20](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L20)

Version of the resource (e.g., '1.0.0', 'v2', '2023-11-01')

***

### deprecation?

> `optional` **deprecation**: [`DeprecationInfo`](../../mcp-tool.interface/interfaces/DeprecationInfo.md)

Defined in: [src/interfaces/mcp-resource.interface.ts:24](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-resource.interface.ts#L24)

Deprecation information
