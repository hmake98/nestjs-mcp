[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [modules/mcp.module](../README.md) / MCPModule

# Class: MCPModule

Defined in: [src/modules/mcp.module.ts:29](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/modules/mcp.module.ts#L29)

Main MCP Module for NestJS integration

## Implements

- `OnModuleInit`

## Constructors

### Constructor

> **new MCPModule**(`options`, `discoveryService`, `registryService`): `MCPModule`

Defined in: [src/modules/mcp.module.ts:32](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/modules/mcp.module.ts#L32)

#### Parameters

##### options

[`MCPModuleOptions`](../../../interfaces/mcp-options.interface/interfaces/MCPModuleOptions.md)

##### discoveryService

[`MCPDiscoveryService`](../../../services/mcp-discovery.service/classes/MCPDiscoveryService.md)

##### registryService

[`MCPRegistryService`](../../../services/mcp-registry.service/classes/MCPRegistryService.md)

#### Returns

`MCPModule`

## Methods

### forRoot()

> `static` **forRoot**(`options`): `DynamicModule`

Defined in: [src/modules/mcp.module.ts:48](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/modules/mcp.module.ts#L48)

Register the MCP module with synchronous options

#### Parameters

##### options

[`MCPModuleOptions`](../../../interfaces/mcp-options.interface/interfaces/MCPModuleOptions.md)

#### Returns

`DynamicModule`

***

### forRootAsync()

> `static` **forRootAsync**(`options`): `DynamicModule`

Defined in: [src/modules/mcp.module.ts:77](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/modules/mcp.module.ts#L77)

Register the MCP module with asynchronous options

#### Parameters

##### options

[`MCPModuleAsyncOptions`](../../../interfaces/mcp-options.interface/interfaces/MCPModuleAsyncOptions.md)

#### Returns

`DynamicModule`

***

### forFeature()

> `static` **forFeature**(): `DynamicModule`

Defined in: [src/modules/mcp.module.ts:104](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/modules/mcp.module.ts#L104)

Register the MCP module for features (without controller)
Use this when you want to use MCP services in a module without exposing HTTP endpoints

#### Returns

`DynamicModule`

***

### onModuleInit()

> **onModuleInit**(): `Promise`\<`void`\>

Defined in: [src/modules/mcp.module.ts:128](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/modules/mcp.module.ts#L128)

Initialize module and discover tools, resources, and prompts

#### Returns

`Promise`\<`void`\>

#### Implementation of

`OnModuleInit.onModuleInit`
