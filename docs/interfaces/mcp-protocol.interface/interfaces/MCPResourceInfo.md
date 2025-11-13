[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-protocol.interface](../README.md) / MCPResourceInfo

# Interface: MCPResourceInfo

Defined in: [src/interfaces/mcp-protocol.interface.ts:114](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L114)

MCP Resource interfaces

## Properties

### uri

> **uri**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:115](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L115)

***

### name

> **name**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:116](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L116)

***

### description?

> `optional` **description**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:117](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L117)

***

### mimeType?

> `optional` **mimeType**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:118](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L118)

***

### version?

> `optional` **version**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:122](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L122)

Version of the resource (e.g., '1.0.0', 'v2', '2023-11-01')

***

### deprecated?

> `optional` **deprecated**: `boolean`

Defined in: [src/interfaces/mcp-protocol.interface.ts:126](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L126)

Deprecation status - true if deprecated

***

### deprecationMessage?

> `optional` **deprecationMessage**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:130](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L130)

Deprecation message with migration guidance
