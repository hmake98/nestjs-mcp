[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [controllers/mcp.controller](../README.md) / MCPController

# Class: MCPController

Defined in: [src/controllers/mcp.controller.ts:23](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/controllers/mcp.controller.ts#L23)

Controller for handling MCP protocol requests via HTTP

## Constructors

### Constructor

> **new MCPController**(`mcpService`, `options`): `MCPController`

Defined in: [src/controllers/mcp.controller.ts:26](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/controllers/mcp.controller.ts#L26)

#### Parameters

##### mcpService

[`MCPService`](../../../services/mcp.service/classes/MCPService.md)

##### options

[`MCPModuleOptions`](../../../interfaces/mcp-options.interface/interfaces/MCPModuleOptions.md)

#### Returns

`MCPController`

## Methods

### handleRequest()

> **handleRequest**(`request`): `Promise`\<[`MCPResponse`](../../../interfaces/mcp-protocol.interface/interfaces/MCPResponse.md)\>

Defined in: [src/controllers/mcp.controller.ts:37](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/controllers/mcp.controller.ts#L37)

Handle MCP JSON-RPC requests

#### Parameters

##### request

[`MCPRequest`](../../../interfaces/mcp-protocol.interface/interfaces/MCPRequest.md)

#### Returns

`Promise`\<[`MCPResponse`](../../../interfaces/mcp-protocol.interface/interfaces/MCPResponse.md)\>

***

### handleBatchRequest()

> **handleBatchRequest**(`requests`): `Promise`\<[`MCPResponse`](../../../interfaces/mcp-protocol.interface/interfaces/MCPResponse.md)[]\>

Defined in: [src/controllers/mcp.controller.ts:56](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/controllers/mcp.controller.ts#L56)

Handle batch requests (multiple requests in one call)

#### Parameters

##### requests

[`MCPRequest`](../../../interfaces/mcp-protocol.interface/interfaces/MCPRequest.md)\<[`JSONObject`](../../../interfaces/mcp-protocol.interface/type-aliases/JSONObject.md)\>[]

#### Returns

`Promise`\<[`MCPResponse`](../../../interfaces/mcp-protocol.interface/interfaces/MCPResponse.md)[]\>

***

### getPlayground()

> **getPlayground**(`res`): `void`

Defined in: [src/controllers/mcp.controller.ts:77](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/controllers/mcp.controller.ts#L77)

#### Parameters

##### res

`Response`

#### Returns

`void`
