[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [utils/zod-helpers](../README.md) / zodSchemaToMCPParameters

# Function: zodSchemaToMCPParameters()

> **zodSchemaToMCPParameters**(`schema`): [`MCPToolParameter`](../../../interfaces/mcp-protocol.interface/interfaces/MCPToolParameter.md)[]

Defined in: [src/utils/zod-helpers.ts:224](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/utils/zod-helpers.ts#L224)

Convert a Zod object schema to MCP tool parameters
This extracts parameter metadata from Zod schemas for backward compatibility

## Parameters

### schema

`ZodObject`\<`ZodRawShape`\>

## Returns

[`MCPToolParameter`](../../../interfaces/mcp-protocol.interface/interfaces/MCPToolParameter.md)[]
