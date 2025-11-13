[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [guards/permission.guard](../README.md) / PermissionGuard

# Class: PermissionGuard

Defined in: src/guards/permission.guard.ts:42

Permission-based authorization guard
Checks if the user has required permissions to access a resource

## Example

```typescript
@Injectable()
class CustomPermissionGuard extends PermissionGuard {
  async canActivate(context: MCPExecutionContext): Promise<boolean> {
    const request = context.getRequest();
    const requiredPermission = context.getMetadata<string>('permission');
    const userPermissions = this.getUserPermissions(request);

    if (!requiredPermission) return true;
    if (!userPermissions.includes(requiredPermission)) {
      throw new MCPForbiddenException(`Missing permission: ${requiredPermission}`);
    }
    return true;
  }
}

// Usage with custom metadata decorator
@Injectable()
class MyToolProvider {
  @RequirePermission('admin')
  @UseMCPGuards(CustomPermissionGuard)
  @MCPTool({ name: 'admin_tool', description: 'Admin only tool' })
  async adminTool() {
    return 'Admin data';
  }
}
```

## Implements

- [`MCPGuard`](../../../interfaces/mcp-execution.interface/interfaces/MCPGuard.md)

## Constructors

### Constructor

> **new PermissionGuard**(): `PermissionGuard`

#### Returns

`PermissionGuard`

## Methods

### canActivate()

> **canActivate**(`context`): `Promise`\<`boolean`\>

Defined in: src/guards/permission.guard.ts:43

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

### extractPermissions()

> `protected` **extractPermissions**(`request`): `string`[]

Defined in: src/guards/permission.guard.ts:69

Extract user permissions from request - override this

#### Parameters

##### request

`Record`\<`string`, `unknown`\>

#### Returns

`string`[]
