[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-protocol.interface](../README.md) / MCPPromptInfo

# Interface: MCPPromptInfo

Defined in: [src/interfaces/mcp-protocol.interface.ts:162](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L162)

MCP Prompt interfaces

## Properties

### name

> **name**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:163](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L163)

***

### description?

> `optional` **description**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:164](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L164)

***

### arguments?

> `optional` **arguments**: `object`[]

Defined in: [src/interfaces/mcp-protocol.interface.ts:165](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L165)

#### name

> **name**: `string`

#### description?

> `optional` **description**: `string`

#### required?

> `optional` **required**: `boolean`

***

### version?

> `optional` **version**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:173](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L173)

Version of the prompt (e.g., '1.0.0', 'v2', '2023-11-01')

***

### deprecated?

> `optional` **deprecated**: `boolean`

Defined in: [src/interfaces/mcp-protocol.interface.ts:177](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L177)

Deprecation status - true if deprecated

***

### deprecationMessage?

> `optional` **deprecationMessage**: `string`

Defined in: [src/interfaces/mcp-protocol.interface.ts:181](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-protocol.interface.ts#L181)

Deprecation message with migration guidance
