[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-protocol.interface](../README.md) / MCPInitializeResponse

# Interface: MCPInitializeResponse

Defined in: [src/interfaces/mcp-protocol.interface.ts:243](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L243)

## Extends

- [`MCPResponse`](MCPResponse.md)

## Properties

### jsonrpc

> **jsonrpc**: `"2.0"`

Defined in: [src/interfaces/mcp-protocol.interface.ts:31](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L31)

#### Inherited from

[`MCPResponse`](MCPResponse.md).[`jsonrpc`](MCPResponse.md#jsonrpc)

***

### id

> **id**: `string` \| `number`

Defined in: [src/interfaces/mcp-protocol.interface.ts:32](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L32)

#### Inherited from

[`MCPResponse`](MCPResponse.md).[`id`](MCPResponse.md#id)

***

### error?

> `optional` **error**: [`MCPError`](MCPError.md)

Defined in: [src/interfaces/mcp-protocol.interface.ts:34](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L34)

#### Inherited from

[`MCPResponse`](MCPResponse.md).[`error`](MCPResponse.md#error)

***

### result

> **result**: `object`

Defined in: [src/interfaces/mcp-protocol.interface.ts:244](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L244)

#### protocolVersion

> **protocolVersion**: `string`

#### capabilities

> **capabilities**: [`MCPServerCapabilities`](MCPServerCapabilities.md)

#### serverInfo

> **serverInfo**: [`MCPServerInfo`](MCPServerInfo.md)

#### Overrides

[`MCPResponse`](MCPResponse.md).[`result`](MCPResponse.md#result)
