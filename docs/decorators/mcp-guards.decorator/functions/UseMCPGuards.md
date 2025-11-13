[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [decorators/mcp-guards.decorator](../README.md) / UseMCPGuards

# Function: UseMCPGuards()

> **UseMCPGuards**(...`guards`): `MethodDecorator`

Defined in: src/decorators/mcp-guards.decorator.ts:26

Decorator to apply guards to MCP tools, resources, or prompts
Guards control access and determine if an operation can execute

## Parameters

### guards

...[`MCPGuardType`](../../../interfaces/mcp-execution.interface/type-aliases/MCPGuardType.md)[]

Guard classes to apply

## Returns

`MethodDecorator`

## Example

```typescript
@Injectable()
class MyToolProvider {
  @UseMCPGuards(AuthGuard, RateLimitGuard)
  @MCPTool({
    name: 'secure_tool',
    description: 'A secured tool'
  })
  async secureTool() {
    return 'Protected data';
  }
}
```
