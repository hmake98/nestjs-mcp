[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interceptors/timeout.interceptor](../README.md) / TimeoutInterceptor

# Class: TimeoutInterceptor

Defined in: src/interceptors/timeout.interceptor.ts:26

Timeout interceptor - ensures operations complete within a time limit

## Example

```typescript
@Injectable()
class MyToolProvider {
  @UseMCPInterceptors(new TimeoutInterceptor(5000)) // 5 second timeout
  @MCPTool({ name: 'slow_tool', description: 'Tool with timeout' })
  async slowTool() {
    // Long running operation
    return 'Result';
  }
}
```

## Implements

- [`MCPInterceptor`](../../../interfaces/mcp-execution.interface/interfaces/MCPInterceptor.md)

## Constructors

### Constructor

> **new TimeoutInterceptor**(`timeout`): `TimeoutInterceptor`

Defined in: src/interceptors/timeout.interceptor.ts:27

#### Parameters

##### timeout

`number` = `30000`

#### Returns

`TimeoutInterceptor`

## Methods

### intercept()

> **intercept**(`context`, `next`): `Promise`\<`unknown`\>

Defined in: src/interceptors/timeout.interceptor.ts:29

Intercept the handler execution

#### Parameters

##### context

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md)

Execution context

##### next

[`MCPCallHandler`](../../../interfaces/mcp-execution.interface/interfaces/MCPCallHandler.md)

Call handler function

#### Returns

`Promise`\<`unknown`\>

The result or a transformed result

#### Implementation of

[`MCPInterceptor`](../../../interfaces/mcp-execution.interface/interfaces/MCPInterceptor.md).[`intercept`](../../../interfaces/mcp-execution.interface/interfaces/MCPInterceptor.md#intercept)
