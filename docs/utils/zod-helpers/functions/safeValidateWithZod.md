[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [utils/zod-helpers](../README.md) / safeValidateWithZod

# Function: safeValidateWithZod()

> **safeValidateWithZod**\<`T`\>(`schema`, `data`): `SafeParseReturnType`\<`unknown`, `T`\>

Defined in: [src/utils/zod-helpers.ts:320](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/utils/zod-helpers.ts#L320)

Validate input against a Zod schema (safe version)
Returns result object with success status and data or error

## Type Parameters

### T

`T`

## Parameters

### schema

`ZodType`\<`T`\>

### data

`unknown`

## Returns

`SafeParseReturnType`\<`unknown`, `T`\>
