[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [services/mcp-discovery.service](../README.md) / MCPDiscoveryService

# Class: MCPDiscoveryService

Defined in: [src/services/mcp-discovery.service.ts:25](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-discovery.service.ts#L25)

Service responsible for discovering MCP tools, resources, and prompts
from providers decorated with MCP decorators

## Constructors

### Constructor

> **new MCPDiscoveryService**(`discoveryService`, `metadataScanner`, `reflector`): `MCPDiscoveryService`

Defined in: [src/services/mcp-discovery.service.ts:26](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-discovery.service.ts#L26)

#### Parameters

##### discoveryService

`DiscoveryService`

##### metadataScanner

`MetadataScanner`

##### reflector

`Reflector`

#### Returns

`MCPDiscoveryService`

## Methods

### discoverTools()

> **discoverTools**(): [`MCPToolDefinition`](../../../interfaces/mcp-protocol.interface/interfaces/MCPToolDefinition.md)[]

Defined in: [src/services/mcp-discovery.service.ts:35](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-discovery.service.ts#L35)

Discover all MCP tools from providers

#### Returns

[`MCPToolDefinition`](../../../interfaces/mcp-protocol.interface/interfaces/MCPToolDefinition.md)[]

***

### discoverResources()

> **discoverResources**(): [`DiscoveredMCPResource`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPResource.md)[]

Defined in: [src/services/mcp-discovery.service.ts:109](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-discovery.service.ts#L109)

Discover all MCP resources from providers

#### Returns

[`DiscoveredMCPResource`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPResource.md)[]

***

### discoverPrompts()

> **discoverPrompts**(): [`DiscoveredMCPPrompt`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPPrompt.md)[]

Defined in: [src/services/mcp-discovery.service.ts:169](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/services/mcp-discovery.service.ts#L169)

Discover all MCP prompts from providers

#### Returns

[`DiscoveredMCPPrompt`](../../../interfaces/mcp-protocol.interface/interfaces/DiscoveredMCPPrompt.md)[]
