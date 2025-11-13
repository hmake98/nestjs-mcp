[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [decorators/mcp-interceptors.decorator](../README.md) / UseMCPInterceptors

# Function: UseMCPInterceptors()

> **UseMCPInterceptors**(...`interceptors`): `MethodDecorator`

Defined in: src/decorators/mcp-interceptors.decorator.ts:27

Decorator to apply interceptors to MCP tools, resources, or prompts
Interceptors wrap handler execution for cross-cutting concerns like logging,
transformation, error handling, and performance monitoring

## Parameters

### interceptors

...[`MCPInterceptorType`](../../../interfaces/mcp-execution.interface/type-aliases/MCPInterceptorType.md)[]

Interceptor classes to apply

## Returns

`MethodDecorator`

## Example

```typescript
@Injectable()
class MyToolProvider {
  @UseMCPInterceptors(LoggingInterceptor, TimeoutInterceptor)
  @MCPTool({
    name: 'monitored_tool',
    description: 'A tool with logging and timeout'
  })
  async monitoredTool() {
    return 'Result';
  }
}
```
