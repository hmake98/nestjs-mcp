[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-protocol.interface](../README.md) / MCPPromptMessage

# Interface: MCPPromptMessage

Defined in: [src/interfaces/mcp-protocol.interface.ts:184](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L184)

## Properties

### role

> **role**: `"user"` \| `"assistant"`

Defined in: [src/interfaces/mcp-protocol.interface.ts:185](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L185)

***

### content

> **content**: `object`

Defined in: [src/interfaces/mcp-protocol.interface.ts:186](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L186)

#### type

> **type**: `"text"` \| `"image"` \| `"resource"`

#### text?

> `optional` **text**: `string`

#### data?

> `optional` **data**: `string`

#### mimeType?

> `optional` **mimeType**: `string`
