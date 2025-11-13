[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interceptors/error-mapping.interceptor](../README.md) / ErrorMappingInterceptor

# Class: ErrorMappingInterceptor

Defined in: src/interceptors/error-mapping.interceptor.ts:28

Error mapping interceptor - transforms errors into consistent MCP exceptions
Maps common error types to appropriate MCP error codes

## Example

```typescript
@Injectable()
class MyToolProvider {
  @UseMCPInterceptors(ErrorMappingInterceptor)
  @MCPTool({ name: 'my_tool', description: 'Tool with error mapping' })
  async myTool() {
    throw new Error('Database connection failed');
    // Will be mapped to MCPException with appropriate code
  }
}
```

## Implements

- [`MCPInterceptor`](../../../interfaces/mcp-execution.interface/interfaces/MCPInterceptor.md)

## Constructors

### Constructor

> **new ErrorMappingInterceptor**(): `ErrorMappingInterceptor`

#### Returns

`ErrorMappingInterceptor`

## Methods

### intercept()

> **intercept**(`context`, `next`): `Promise`\<`unknown`\>

Defined in: src/interceptors/error-mapping.interceptor.ts:29

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

***

### mapError()

> `protected` **mapError**(`error`): [`MCPException`](../../../interfaces/mcp-execution.interface/classes/MCPException.md)

Defined in: src/interceptors/error-mapping.interceptor.ts:49

Map errors to MCP exceptions - override this to customize

#### Parameters

##### error

`unknown`

#### Returns

[`MCPException`](../../../interfaces/mcp-execution.interface/classes/MCPException.md)
