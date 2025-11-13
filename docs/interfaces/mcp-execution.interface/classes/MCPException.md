[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-execution.interface](../README.md) / MCPException

# Class: MCPException

Defined in: src/interfaces/mcp-execution.interface.ts:139

Exception that can be thrown by guards or interceptors

## Extends

- `Error`

## Extended by

- [`MCPForbiddenException`](MCPForbiddenException.md)
- [`MCPUnauthorizedException`](MCPUnauthorizedException.md)
- [`MCPRateLimitException`](MCPRateLimitException.md)
- [`MCPTimeoutException`](MCPTimeoutException.md)

## Constructors

### Constructor

> **new MCPException**(`code`, `message`, `data?`): `MCPException`

Defined in: src/interfaces/mcp-execution.interface.ts:140

#### Parameters

##### code

`number`

##### message

`string`

##### data?

`unknown`

#### Returns

`MCPException`

#### Overrides

`Error.constructor`

## Properties

### code

> `readonly` **code**: `number`

Defined in: src/interfaces/mcp-execution.interface.ts:141

***

### data?

> `readonly` `optional` **data**: `unknown`

Defined in: src/interfaces/mcp-execution.interface.ts:143
