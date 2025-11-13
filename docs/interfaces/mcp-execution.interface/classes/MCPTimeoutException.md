[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-execution.interface](../README.md) / MCPTimeoutException

# Class: MCPTimeoutException

Defined in: src/interfaces/mcp-execution.interface.ts:183

Timeout exception - thrown when operation times out

## Extends

- [`MCPException`](MCPException.md)

## Constructors

### Constructor

> **new MCPTimeoutException**(`message`, `data?`): `MCPTimeoutException`

Defined in: src/interfaces/mcp-execution.interface.ts:184

#### Parameters

##### message

`string` = `'Operation timed out'`

##### data?

`unknown`

#### Returns

`MCPTimeoutException`

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
