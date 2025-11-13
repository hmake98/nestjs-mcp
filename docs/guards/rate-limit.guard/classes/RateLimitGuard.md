[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [guards/rate-limit.guard](../README.md) / RateLimitGuard

# Class: RateLimitGuard

Defined in: src/guards/rate-limit.guard.ts:39

Rate limit guard - limits the number of requests per time window
This is a simple in-memory implementation. For production, use Redis or similar.

## Example

```typescript
@Injectable()
class MyToolProvider {
  @UseMCPGuards(RateLimitGuard)
  @MCPTool({ name: 'expensive_tool', description: 'Rate limited tool' })
  async expensiveTool() {
    return 'Result';
  }
}
```

## Implements

- [`MCPGuard`](../../../interfaces/mcp-execution.interface/interfaces/MCPGuard.md)

## Constructors

### Constructor

> **new RateLimitGuard**(`config?`): `RateLimitGuard`

Defined in: src/guards/rate-limit.guard.ts:46

#### Parameters

##### config?

`Partial`\<`RateLimitConfig`\>

#### Returns

`RateLimitGuard`

## Methods

### canActivate()

> **canActivate**(`context`): `Promise`\<`boolean`\>

Defined in: src/guards/rate-limit.guard.ts:53

Determine if the operation can proceed

#### Parameters

##### context

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md)

#### Returns

`Promise`\<`boolean`\>

true if allowed, false if denied, or throws an exception

#### Implementation of

[`MCPGuard`](../../../interfaces/mcp-execution.interface/interfaces/MCPGuard.md).[`canActivate`](../../../interfaces/mcp-execution.interface/interfaces/MCPGuard.md#canactivate)
