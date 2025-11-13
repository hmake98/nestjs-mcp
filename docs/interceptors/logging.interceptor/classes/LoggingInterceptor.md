[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interceptors/logging.interceptor](../README.md) / LoggingInterceptor

# Class: LoggingInterceptor

Defined in: src/interceptors/logging.interceptor.ts:26

Logging interceptor - logs before and after handler execution
Includes timing information and error logging

## Example

```typescript
@Injectable()
class MyToolProvider {
  @UseMCPInterceptors(LoggingInterceptor)
  @MCPTool({ name: 'my_tool', description: 'Logged tool' })
  async myTool() {
    return 'Result';
  }
}
```

## Implements

- [`MCPInterceptor`](../../../interfaces/mcp-execution.interface/interfaces/MCPInterceptor.md)

## Constructors

### Constructor

> **new LoggingInterceptor**(`logLevel`): `LoggingInterceptor`

Defined in: src/interceptors/logging.interceptor.ts:29

#### Parameters

##### logLevel

[`LogLevel`](../../../interfaces/mcp-logger.interface/enumerations/LogLevel.md) = `LogLevel.INFO`

#### Returns

`LoggingInterceptor`

## Methods

### intercept()

> **intercept**(`context`, `next`): `Promise`\<`unknown`\>

Defined in: src/interceptors/logging.interceptor.ts:33

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
