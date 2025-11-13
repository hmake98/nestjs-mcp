[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [services/mcp-registry.service](../README.md) / MCPRegistryService

# Class: MCPRegistryService

Defined in: [src/services/mcp-registry.service.ts:15](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L15)

Registry service for managing MCP tools, resources, and prompts

## Constructors

### Constructor

> **new MCPRegistryService**(`options`): `MCPRegistryService`

Defined in: [src/services/mcp-registry.service.ts:21](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L21)

#### Parameters

##### options

[`MCPModuleOptions`](../../../interfaces/mcp-options.interface/interfaces/MCPModuleOptions.md)

#### Returns

`MCPRegistryService`

## Methods

### registerTool()

> **registerTool**(`tool`): `void`

Defined in: [src/services/mcp-registry.service.ts:35](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L35)

Register a tool

#### Parameters

##### tool

[`MCPToolDefinition`](../../../interfaces/mcp-protocol.interface/interfaces/MCPToolDefinition.md)

#### Returns

`void`

***

### registerTools()

> **registerTools**(`tools`): `void`

Defined in: [src/services/mcp-registry.service.ts:48](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L48)

Register multiple tools

#### Parameters

##### tools

[`MCPToolDefinition`](../../../interfaces/mcp-protocol.interface/interfaces/MCPToolDefinition.md)[]

#### Returns

`void`

***

### getTool()

> **getTool**(`name`): [`MCPToolDefinition`](../../../interfaces/mcp-protocol.interface/interfaces/MCPToolDefinition.md) \| `undefined`

Defined in: [src/services/mcp-registry.service.ts:55](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L55)

Get a tool by name

#### Parameters

##### name

`string`

#### Returns

[`MCPToolDefinition`](../../../interfaces/mcp-protocol.interface/interfaces/MCPToolDefinition.md) \| `undefined`

***

### getAllTools()

> **getAllTools**(): [`MCPToolDefinition`](../../../interfaces/mcp-protocol.interface/interfaces/MCPToolDefinition.md)[]

Defined in: [src/services/mcp-registry.service.ts:62](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L62)

Get all registered tools

#### Returns

[`MCPToolDefinition`](../../../interfaces/mcp-protocol.interface/interfaces/MCPToolDefinition.md)[]

***

### hasTool()

> **hasTool**(`name`): `boolean`

Defined in: [src/services/mcp-registry.service.ts:69](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L69)

Check if a tool exists

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### unregisterTool()

> **unregisterTool**(`name`): `boolean`

Defined in: [src/services/mcp-registry.service.ts:76](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L76)

Unregister a tool

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### registerResource()

> **registerResource**(`resource`): `void`

Defined in: [src/services/mcp-registry.service.ts:87](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L87)

Register a resource

#### Parameters

##### resource

[`DiscoveredMCPResource`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPResource.md)

#### Returns

`void`

***

### registerResources()

> **registerResources**(`resources`): `void`

Defined in: [src/services/mcp-registry.service.ts:101](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L101)

Register multiple resources

#### Parameters

##### resources

[`DiscoveredMCPResource`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPResource.md)[]

#### Returns

`void`

***

### getResource()

> **getResource**(`uri`): [`DiscoveredMCPResource`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPResource.md) \| `undefined`

Defined in: [src/services/mcp-registry.service.ts:108](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L108)

Get a resource by URI

#### Parameters

##### uri

`string`

#### Returns

[`DiscoveredMCPResource`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPResource.md) \| `undefined`

***

### getAllResources()

> **getAllResources**(): [`DiscoveredMCPResource`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPResource.md)[]

Defined in: [src/services/mcp-registry.service.ts:115](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L115)

Get all registered resources

#### Returns

[`DiscoveredMCPResource`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPResource.md)[]

***

### hasResource()

> **hasResource**(`uri`): `boolean`

Defined in: [src/services/mcp-registry.service.ts:122](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L122)

Check if a resource exists

#### Parameters

##### uri

`string`

#### Returns

`boolean`

***

### findResourceByPattern()

> **findResourceByPattern**(`uri`): [`DiscoveredMCPResource`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPResource.md) \| `undefined`

Defined in: [src/services/mcp-registry.service.ts:129](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L129)

Find resource by URI pattern (for templates)

#### Parameters

##### uri

`string`

#### Returns

[`DiscoveredMCPResource`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPResource.md) \| `undefined`

***

### registerPrompt()

> **registerPrompt**(`prompt`): `void`

Defined in: [src/services/mcp-registry.service.ts:144](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L144)

Register a prompt

#### Parameters

##### prompt

[`DiscoveredMCPPrompt`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPPrompt.md)

#### Returns

`void`

***

### registerPrompts()

> **registerPrompts**(`prompts`): `void`

Defined in: [src/services/mcp-registry.service.ts:157](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L157)

Register multiple prompts

#### Parameters

##### prompts

[`DiscoveredMCPPrompt`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPPrompt.md)[]

#### Returns

`void`

***

### getPrompt()

> **getPrompt**(`name`): [`DiscoveredMCPPrompt`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPPrompt.md) \| `undefined`

Defined in: [src/services/mcp-registry.service.ts:164](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L164)

Get a prompt by name

#### Parameters

##### name

`string`

#### Returns

[`DiscoveredMCPPrompt`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPPrompt.md) \| `undefined`

***

### getAllPrompts()

> **getAllPrompts**(): [`DiscoveredMCPPrompt`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPPrompt.md)[]

Defined in: [src/services/mcp-registry.service.ts:171](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L171)

Get all registered prompts

#### Returns

[`DiscoveredMCPPrompt`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPPrompt.md)[]

***

### hasPrompt()

> **hasPrompt**(`name`): `boolean`

Defined in: [src/services/mcp-registry.service.ts:178](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L178)

Check if a prompt exists

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### clear()

> **clear**(): `void`

Defined in: [src/services/mcp-registry.service.ts:185](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L185)

Clear all registrations

#### Returns

`void`

***

### extractUriVariables()

> **extractUriVariables**(`template`, `uri`): `Record`\<`string`, `string`\>

Defined in: [src/services/mcp-registry.service.ts:205](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-registry.service.ts#L205)

Extract variables from URI using template

#### Parameters

##### template

`string`

##### uri

`string`

#### Returns

`Record`\<`string`, `string`\>
