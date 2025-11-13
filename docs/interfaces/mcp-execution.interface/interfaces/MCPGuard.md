[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-execution.interface](../README.md) / MCPGuard

# Interface: MCPGuard

Defined in: src/interfaces/mcp-execution.interface.ts:92

Guard interface - determines if an operation can be executed

## Methods

### canActivate()

> **canActivate**(`context`): `boolean` \| `Promise`\<`boolean`\>

Defined in: src/interfaces/mcp-execution.interface.ts:97

Determine if the operation can proceed

#### Parameters

##### context

[`MCPExecutionContext`](MCPExecutionContext.md)

#### Returns

`boolean` \| `Promise`\<`boolean`\>

true if allowed, false if denied, or throws an exception
