[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-protocol.interface](../README.md) / MCPResponse

# Interface: MCPResponse

Defined in: [src/interfaces/mcp-protocol.interface.ts:30](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L30)

## Extended by

- [`MCPInitializeResponse`](MCPInitializeResponse.md)

## Properties

### jsonrpc

> **jsonrpc**: `"2.0"`

Defined in: [src/interfaces/mcp-protocol.interface.ts:31](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L31)

***

### id

> **id**: `string` \| `number`

Defined in: [src/interfaces/mcp-protocol.interface.ts:32](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L32)

***

### result?

> `optional` **result**: `unknown`

Defined in: [src/interfaces/mcp-protocol.interface.ts:33](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L33)

***

### error?

> `optional` **error**: [`MCPError`](MCPError.md)

Defined in: [src/interfaces/mcp-protocol.interface.ts:34](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L34)
