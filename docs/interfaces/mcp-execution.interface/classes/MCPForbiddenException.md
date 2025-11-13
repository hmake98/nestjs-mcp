[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-execution.interface](../README.md) / MCPForbiddenException

# Class: MCPForbiddenException

Defined in: src/interfaces/mcp-execution.interface.ts:153

Forbidden exception - thrown when access is denied

## Extends

- [`MCPException`](MCPException.md)

## Constructors

### Constructor

> **new MCPForbiddenException**(`message`, `data?`): `MCPForbiddenException`

Defined in: src/interfaces/mcp-execution.interface.ts:154

#### Parameters

##### message

`string` = `'Forbidden'`

##### data?

`unknown`

#### Returns

`MCPForbiddenException`

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
