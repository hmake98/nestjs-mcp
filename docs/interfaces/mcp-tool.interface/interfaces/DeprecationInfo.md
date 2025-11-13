[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-tool.interface](../README.md) / DeprecationInfo

# Interface: DeprecationInfo

Defined in: [src/interfaces/mcp-tool.interface.ts:7](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L7)

Deprecation information for MCP items

## Properties

### deprecated

> **deprecated**: `boolean`

Defined in: [src/interfaces/mcp-tool.interface.ts:11](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L11)

Whether the item is deprecated

***

### message?

> `optional` **message**: `string`

Defined in: [src/interfaces/mcp-tool.interface.ts:15](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L15)

Deprecation message explaining why and what to use instead

***

### since?

> `optional` **since**: `string`

Defined in: [src/interfaces/mcp-tool.interface.ts:19](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L19)

Version when the item was deprecated

***

### removeIn?

> `optional` **removeIn**: `string`

Defined in: [src/interfaces/mcp-tool.interface.ts:23](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L23)

Version when the item will be removed

***

### replacedBy?

> `optional` **replacedBy**: `string`

Defined in: [src/interfaces/mcp-tool.interface.ts:27](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-tool.interface.ts#L27)

Replacement item name/identifier
