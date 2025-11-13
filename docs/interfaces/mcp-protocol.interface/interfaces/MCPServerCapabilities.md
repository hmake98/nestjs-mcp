[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-protocol.interface](../README.md) / MCPServerCapabilities

# Interface: MCPServerCapabilities

Defined in: [src/interfaces/mcp-protocol.interface.ts:197](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L197)

MCP Server capabilities

## Indexable

\[`x`: `string`\]: `unknown`

## Properties

### tools?

> `optional` **tools**: `object`

Defined in: [src/interfaces/mcp-protocol.interface.ts:199](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L199)

#### listChanged?

> `optional` **listChanged**: `boolean`

***

### resources?

> `optional` **resources**: `object`

Defined in: [src/interfaces/mcp-protocol.interface.ts:202](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L202)

#### subscribe?

> `optional` **subscribe**: `boolean`

#### listChanged?

> `optional` **listChanged**: `boolean`

***

### prompts?

> `optional` **prompts**: `object`

Defined in: [src/interfaces/mcp-protocol.interface.ts:206](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L206)

#### listChanged?

> `optional` **listChanged**: `boolean`

***

### logging?

> `optional` **logging**: [`JSONObject`](../type-aliases/JSONObject.md)

Defined in: [src/interfaces/mcp-protocol.interface.ts:209](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L209)

***

### experimental?

> `optional` **experimental**: [`JSONObject`](../type-aliases/JSONObject.md)

Defined in: [src/interfaces/mcp-protocol.interface.ts:210](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L210)

***

### completions?

> `optional` **completions**: [`JSONObject`](../type-aliases/JSONObject.md)

Defined in: [src/interfaces/mcp-protocol.interface.ts:211](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L211)
