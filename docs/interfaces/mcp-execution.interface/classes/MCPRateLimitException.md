[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-execution.interface](../README.md) / MCPRateLimitException

# Class: MCPRateLimitException

Defined in: src/interfaces/mcp-execution.interface.ts:173

Rate limit exception - thrown when rate limit is exceeded

## Extends

- [`MCPException`](MCPException.md)

## Constructors

### Constructor

> **new MCPRateLimitException**(`message`, `data?`): `MCPRateLimitException`

Defined in: src/interfaces/mcp-execution.interface.ts:174

#### Parameters

##### message

`string` = `'Rate limit exceeded'`

##### data?

`unknown`

#### Returns

`MCPRateLimitException`

#### Overrides

[`MCPException`](MCPException.md).[`constructor`](MCPException.md#constructor)

## Properties

### code

> `readonly` **code**: `number`

Defined in: src/interfaces/mcp-execution.interface.ts:141

#### Inherited from

[`MCPException`](MCPException.md).[`code`](MCPException.md#code)

***

### data?

> `readonly` `optional` **data**: `unknown`

Defined in: src/interfaces/mcp-execution.interface.ts:143

#### Inherited from

[`MCPException`](MCPException.md).[`data`](MCPException.md#data)
