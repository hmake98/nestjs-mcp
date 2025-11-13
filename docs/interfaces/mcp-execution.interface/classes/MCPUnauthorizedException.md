[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-execution.interface](../README.md) / MCPUnauthorizedException

# Class: MCPUnauthorizedException

Defined in: src/interfaces/mcp-execution.interface.ts:163

Unauthorized exception - thrown when authentication is required

## Extends

- [`MCPException`](MCPException.md)

## Constructors

### Constructor

> **new MCPUnauthorizedException**(`message`, `data?`): `MCPUnauthorizedException`

Defined in: src/interfaces/mcp-execution.interface.ts:164

#### Parameters

##### message

`string` = `'Unauthorized'`

##### data?

`unknown`

#### Returns

`MCPUnauthorizedException`

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
