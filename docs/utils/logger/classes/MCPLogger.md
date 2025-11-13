[**NestJS MCP v0.1.0**](../../../README.md)

***

[NestJS MCP](../../../modules.md) / [utils/logger](../README.md) / MCPLogger

# Class: MCPLogger

Defined in: [src/utils/logger.ts:18](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/utils/logger.ts#L18)

Custom logger for MCP module with log level support

## Constructors

### Constructor

> **new MCPLogger**(`context`, `logLevel`): `MCPLogger`

Defined in: [src/utils/logger.ts:22](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/utils/logger.ts#L22)

#### Parameters

##### context

`string`

##### logLevel

[`LogLevelName`](../../../interfaces/mcp-logger.interface/type-aliases/LogLevelName.md) | [`LogLevel`](../../../interfaces/mcp-logger.interface/enumerations/LogLevel.md)

#### Returns

`MCPLogger`

## Methods

### setLogLevel()

> **setLogLevel**(`level`): `void`

Defined in: [src/utils/logger.ts:34](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/utils/logger.ts#L34)

Set the log level

#### Parameters

##### level

[`LogLevelName`](../../../interfaces/mcp-logger.interface/type-aliases/LogLevelName.md) | [`LogLevel`](../../../interfaces/mcp-logger.interface/enumerations/LogLevel.md)

#### Returns

`void`

***

### getLogLevel()

> **getLogLevel**(): [`LogLevel`](../../../interfaces/mcp-logger.interface/enumerations/LogLevel.md)

Defined in: [src/utils/logger.ts:42](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/utils/logger.ts#L42)

Get current log level

#### Returns

[`LogLevel`](../../../interfaces/mcp-logger.interface/enumerations/LogLevel.md)

***

### error()

> **error**(`message`, `trace?`, `context?`): `void`

Defined in: [src/utils/logger.ts:56](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/utils/logger.ts#L56)

Log an error message

#### Parameters

##### message

`string`

##### trace?

`unknown`

##### context?

`string`

#### Returns

`void`

***

### warn()

> **warn**(`message`, `context?`): `void`

Defined in: [src/utils/logger.ts:74](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/utils/logger.ts#L74)

Log a warning message

#### Parameters

##### message

`string`

##### context?

`string`

#### Returns

`void`

***

### log()

> **log**(`message`, `context?`): `void`

Defined in: [src/utils/logger.ts:83](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/utils/logger.ts#L83)

Log an info message

#### Parameters

##### message

`string`

##### context?

`string`

#### Returns

`void`

***

### debug()

> **debug**(`message`, `context?`): `void`

Defined in: [src/utils/logger.ts:92](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/utils/logger.ts#L92)

Log a debug message

#### Parameters

##### message

`string`

##### context?

`string`

#### Returns

`void`

***

### verbose()

> **verbose**(`message`, `context?`): `void`

Defined in: [src/utils/logger.ts:101](https://github.com/hmake98/nestjs-mcp/blob/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99/src/utils/logger.ts#L101)

Log a verbose message

#### Parameters

##### message

`string`

##### context?

`string`

#### Returns

`void`
