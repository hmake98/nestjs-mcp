[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-tool.interface](../README.md) / MCPToolMetadata

# Interface: MCPToolMetadata

Defined in: [src/interfaces/mcp-tool.interface.ts:33](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L33)

Metadata for MCP tool

## Extended by

- [`MCPToolWithParamsMetadata`](MCPToolWithParamsMetadata.md)

## Properties

### name

> **name**: `string`

Defined in: [src/interfaces/mcp-tool.interface.ts:34](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L34)

***

### description

> **description**: `string`

Defined in: [src/interfaces/mcp-tool.interface.ts:35](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L35)

***

### schema?

> `optional` **schema**: `ZodObject`\<`ZodRawShape`, `UnknownKeysParam`, `ZodTypeAny`, \{\[`key`: `string`\]: `any`; \}, \{\[`key`: `string`\]: `any`; \}\>

Defined in: [src/interfaces/mcp-tool.interface.ts:40](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L40)

Zod schema for validating tool input parameters
If provided, this will be used for runtime validation and JSON Schema generation

***

### version?

> `optional` **version**: `string`

Defined in: [src/interfaces/mcp-tool.interface.ts:44](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L44)

Version of the tool (e.g., '1.0.0', 'v2', '2023-11-01')

***

### deprecation?

> `optional` **deprecation**: [`DeprecationInfo`](DeprecationInfo.md)

Defined in: [src/interfaces/mcp-tool.interface.ts:48](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L48)

Deprecation information
