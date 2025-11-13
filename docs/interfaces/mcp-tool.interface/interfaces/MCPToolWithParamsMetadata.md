[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-tool.interface](../README.md) / MCPToolWithParamsMetadata

# Interface: MCPToolWithParamsMetadata

Defined in: [src/interfaces/mcp-tool.interface.ts:54](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L54)

Combined decorator for tool with parameters

## Extends

- [`MCPToolMetadata`](MCPToolMetadata.md)

## Properties

### name

> **name**: `string`

Defined in: [src/interfaces/mcp-tool.interface.ts:34](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L34)

#### Inherited from

[`MCPToolMetadata`](MCPToolMetadata.md).[`name`](MCPToolMetadata.md#name)

***

### description

> **description**: `string`

Defined in: [src/interfaces/mcp-tool.interface.ts:35](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L35)

#### Inherited from

[`MCPToolMetadata`](MCPToolMetadata.md).[`description`](MCPToolMetadata.md#description)

***

### version?

> `optional` **version**: `string`

Defined in: [src/interfaces/mcp-tool.interface.ts:44](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L44)

Version of the tool (e.g., '1.0.0', 'v2', '2023-11-01')

#### Inherited from

[`MCPToolMetadata`](MCPToolMetadata.md).[`version`](MCPToolMetadata.md#version)

***

### deprecation?

> `optional` **deprecation**: [`DeprecationInfo`](DeprecationInfo.md)

Defined in: [src/interfaces/mcp-tool.interface.ts:48](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L48)

Deprecation information

#### Inherited from

[`MCPToolMetadata`](MCPToolMetadata.md).[`deprecation`](MCPToolMetadata.md#deprecation)

***

### parameters?

> `optional` **parameters**: `Omit`\<[`MCPToolParameter`](../../mcp-protocol.interface/interfaces/MCPToolParameter.md), `"name"`\>[]

Defined in: [src/interfaces/mcp-tool.interface.ts:59](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L59)

Manual parameter definitions (legacy approach)
Use 'schema' instead for Zod-based validation

***

### schema?

> `optional` **schema**: `ZodObject`\<`ZodRawShape`, `UnknownKeysParam`, `ZodTypeAny`, \{\[`key`: `string`\]: `any`; \}, \{\[`key`: `string`\]: `any`; \}\>

Defined in: [src/interfaces/mcp-tool.interface.ts:64](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L64)

Zod schema for validating tool input parameters
Preferred over 'parameters' for type-safe validation

#### Overrides

[`MCPToolMetadata`](MCPToolMetadata.md).[`schema`](MCPToolMetadata.md#schema)
