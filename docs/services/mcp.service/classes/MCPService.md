[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [services/mcp.service](../README.md) / MCPService

# Class: MCPService

Defined in: [src/services/mcp.service.ts:36](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp.service.ts#L36)

Main MCP service for handling protocol requests

## Constructors

### Constructor

> **new MCPService**(`options`, `registryService`, `executionService`): `MCPService`

Defined in: [src/services/mcp.service.ts:40](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp.service.ts#L40)

#### Parameters

##### options

[`MCPModuleOptions`](../../../interfaces/mcp-options.interface/interfaces/MCPModuleOptions.md)

##### registryService

[`MCPRegistryService`](../../mcp-registry.service/classes/MCPRegistryService.md)

##### executionService

[`MCPExecutionService`](../../mcp-execution.service/classes/MCPExecutionService.md)

#### Returns

`MCPService`

## Methods

### getSDKServer()

> **getSDKServer**(): `unknown`

Defined in: [src/services/mcp.service.ts:56](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp.service.ts#L56)

Get the SDK server instance (for advanced usage)

#### Returns

`unknown`

***

### handleRequest()

> **handleRequest**(`request`): `Promise`\<[`MCPResponse`](../../../interfaces/mcp-protocol.interface/interfaces/MCPResponse.md)\>

Defined in: [src/services/mcp.service.ts:64](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp.service.ts#L64)

Handle an MCP request

#### Parameters

##### request

[`MCPRequest`](../../../interfaces/mcp-protocol.interface/interfaces/MCPRequest.md)

#### Returns

`Promise`\<[`MCPResponse`](../../../interfaces/mcp-protocol.interface/interfaces/MCPResponse.md)\>

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/services/mcp.service.ts:698](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp.service.ts#L698)

Check if server is initialized

#### Returns

`boolean`
