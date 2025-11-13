[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-protocol.interface](../README.md) / MCPInitializeRequest

# Interface: MCPInitializeRequest

Defined in: [src/interfaces/mcp-protocol.interface.ts:234](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L234)

Initialize request/response

## Extends

- [`MCPRequest`](MCPRequest.md)\<\{ `protocolVersion`: `string`; `capabilities`: [`JSONObject`](../type-aliases/JSONObject.md); `clientInfo`: [`MCPClientInfo`](MCPClientInfo.md); \}\>

## Properties

### jsonrpc

> **jsonrpc**: `"2.0"`

Defined in: [src/interfaces/mcp-protocol.interface.ts:24](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L24)

#### Inherited from

[`MCPRequest`](MCPRequest.md).[`jsonrpc`](MCPRequest.md#jsonrpc)

***

### id

> **id**: `string` \| `number`

Defined in: [src/interfaces/mcp-protocol.interface.ts:25](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L25)

#### Inherited from

[`MCPRequest`](MCPRequest.md).[`id`](MCPRequest.md#id)

***

### params?

> `optional` **params**: `object`

Defined in: [src/interfaces/mcp-protocol.interface.ts:27](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L27)

#### protocolVersion

> **protocolVersion**: `string`

#### capabilities

> **capabilities**: [`JSONObject`](../type-aliases/JSONObject.md)

#### clientInfo

> **clientInfo**: [`MCPClientInfo`](MCPClientInfo.md)

#### Inherited from

[`MCPRequest`](MCPRequest.md).[`params`](MCPRequest.md#params)

***

### method

> **method**: `"initialize"`

Defined in: [src/interfaces/mcp-protocol.interface.ts:240](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L240)

#### Overrides

[`MCPRequest`](MCPRequest.md).[`method`](MCPRequest.md#method)
