[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-protocol.interface](../README.md) / MCPRequest

# Interface: MCPRequest\<P\>

Defined in: [src/interfaces/mcp-protocol.interface.ts:23](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L23)

## Extended by

- [`MCPInitializeRequest`](MCPInitializeRequest.md)

## Type Parameters

### P

`P` = [`JSONObject`](../type-aliases/JSONObject.md)

## Properties

### jsonrpc

> **jsonrpc**: `"2.0"`

Defined in: [src/interfaces/mcp-protocol.interface.ts:24](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L24)

***

### id

> **id**: `string` \| `number`

Defined in: [src/interfaces/mcp-protocol.interface.ts:25](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L25)

***

### method

> **method**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:26](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L26)

***

### params?

> `optional` **params**: `P`

Defined in: [src/interfaces/mcp-protocol.interface.ts:27](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L27)
