[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [interfaces/mcp-options.interface](../README.md) / MCPModuleAsyncOptions

# Interface: MCPModuleAsyncOptions

Defined in: [src/interfaces/mcp-options.interface.ts:71](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L71)

Async options for MCP module

## Extends

- `Pick`\<`ModuleMetadata`, `"imports"`\>

## Properties

### useExisting?

> `optional` **useExisting**: `Type`\<[`MCPOptionsFactory`](MCPOptionsFactory.md)\>

Defined in: [src/interfaces/mcp-options.interface.ts:72](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L72)

***

### useClass?

> `optional` **useClass**: `Type`\<[`MCPOptionsFactory`](MCPOptionsFactory.md)\>

Defined in: [src/interfaces/mcp-options.interface.ts:73](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L73)

***

### useFactory()?

> `optional` **useFactory**: (...`args`) => [`MCPModuleOptions`](MCPModuleOptions.md) \| `Promise`\<[`MCPModuleOptions`](MCPModuleOptions.md)\>

Defined in: [src/interfaces/mcp-options.interface.ts:74](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L74)

#### Parameters

##### args

...`unknown`[]

#### Returns

[`MCPModuleOptions`](MCPModuleOptions.md) \| `Promise`\<[`MCPModuleOptions`](MCPModuleOptions.md)\>

***

### inject?

> `optional` **inject**: (`string` \| `symbol` \| `Type`\<`any`\> \| `Abstract`\<`unknown`\>)[]

Defined in: [src/interfaces/mcp-options.interface.ts:77](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/interfaces/mcp-options.interface.ts#L77)
