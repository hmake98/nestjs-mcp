[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [guards/auth.guard](../README.md) / AuthGuard

# Class: AuthGuard

Defined in: src/guards/auth.guard.ts:38

Simple authentication guard based on API key in request metadata
Override this class to implement your own authentication logic

## Example

```typescript
@Injectable()
class CustomAuthGuard extends AuthGuard {
  async canActivate(context: MCPExecutionContext): Promise<boolean> {
    const request = context.getRequest();
    // Check request headers, JWT tokens, etc.
    const apiKey = request.params?.auth?.apiKey;
    if (!apiKey || !this.validateApiKey(apiKey)) {
      throw new MCPUnauthorizedException('Invalid API key');
    }
    return true;
  }
}

@Injectable()
class MyToolProvider {
  @UseMCPGuards(CustomAuthGuard)
  @MCPTool({ name: 'secure_tool', description: 'Authenticated tool' })
  async secureTool() {
    return 'Protected data';
  }
}
```

## Implements

- [`MCPGuard`](../../../interfaces/mcp-execution.interface/interfaces/MCPGuard.md)

## Constructors

### Constructor

> **new AuthGuard**(): `AuthGuard`

#### Returns

`AuthGuard`

## Methods

### canActivate()

> **canActivate**(`context`): `Promise`\<`boolean`\>

Defined in: src/guards/auth.guard.ts:39

Determine if the operation can proceed

#### Parameters

##### context

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md)

#### Returns

`Promise`\<`boolean`\>

true if allowed, false if denied, or throws an exception

#### Implementation of

[`MCPGuard`](../../../interfaces/mcp-execution.interface/interfaces/MCPGuard.md).[`canActivate`](../../../interfaces/mcp-execution.interface/interfaces/MCPGuard.md#canactivate)

***

### validateApiKey()

> `protected` **validateApiKey**(`apiKey`): `boolean`

Defined in: src/guards/auth.guard.ts:63

Validate API key - override this in your implementation

#### Parameters

##### apiKey

`string`

#### Returns

`boolean`
