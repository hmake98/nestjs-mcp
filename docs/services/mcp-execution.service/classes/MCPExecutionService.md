[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [services/mcp-execution.service](../README.md) / MCPExecutionService

# Class: MCPExecutionService

Defined in: src/services/mcp-execution.service.ts:18

Service for executing guards and interceptors in the MCP execution pipeline

## Constructors

### Constructor

> **new MCPExecutionService**(`moduleRef`): `MCPExecutionService`

Defined in: src/services/mcp-execution.service.ts:19

#### Parameters

##### moduleRef

`ModuleRef`

#### Returns

`MCPExecutionService`

## Methods

### executeGuards()

> **executeGuards**(`guardTypes`, `context`): `Promise`\<`boolean`\>

Defined in: src/services/mcp-execution.service.ts:25

Execute guards before handler

#### Parameters

##### guardTypes

`unknown`[]

##### context

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md)

#### Returns

`Promise`\<`boolean`\>

true if all guards pass, throws exception otherwise

***

### executeInterceptors()

> **executeInterceptors**(`interceptorTypes`, `context`, `handler`): `Promise`\<`unknown`\>

Defined in: src/services/mcp-execution.service.ts:50

Execute interceptors around handler

#### Parameters

##### interceptorTypes

`unknown`[]

##### context

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md)

##### handler

() => `Promise`\<`unknown`\>

#### Returns

`Promise`\<`unknown`\>

***

### executeWithGuardsAndInterceptors()

> **executeWithGuardsAndInterceptors**(`guardTypes`, `interceptorTypes`, `context`, `handler`): `Promise`\<`unknown`\>

Defined in: src/services/mcp-execution.service.ts:93

Execute guards and interceptors together

#### Parameters

##### guardTypes

`unknown`[]

##### interceptorTypes

`unknown`[]

##### context

[`MCPExecutionContext`](../../../interfaces/mcp-execution.interface/interfaces/MCPExecutionContext.md)

##### handler

() => `Promise`\<`unknown`\>

#### Returns

`Promise`\<`unknown`\>
