[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-execution.interface](../README.md) / MCPInterceptor

# Interface: MCPInterceptor

Defined in: src/interfaces/mcp-execution.interface.ts:103

Interceptor interface - wraps handler execution for cross-cutting concerns

## Methods

### intercept()

> **intercept**(`context`, `next`): `Promise`\<`unknown`\>

Defined in: src/interfaces/mcp-execution.interface.ts:110

Intercept the handler execution

#### Parameters

##### context

[`MCPExecutionContext`](MCPExecutionContext.md)

Execution context

##### next

[`MCPCallHandler`](MCPCallHandler.md)

Call handler function

#### Returns

`Promise`\<`unknown`\>

The result or a transformed result
