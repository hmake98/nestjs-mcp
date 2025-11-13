# nestjs-mcp

![Statements](https://img.shields.io/badge/statements-98.83%25-brightgreen.svg?style=flat) ![Branches](https://img.shields.io/badge/branches-83.17%25-yellow.svg?style=flat) ![Functions](https://img.shields.io/badge/functions-97.11%25-brightgreen.svg?style=flat) ![Lines](https://img.shields.io/badge/lines-98.79%25-brightgreen.svg?style=flat)

A NestJS package for integrating MCP (Model Context Protocol) servers into your applications. Built on top of the official `@modelcontextprotocol/sdk` (v1.21.1).

## Features

- 🎯 **Decorator-based API**: Use `@MCPTool`, `@MCPResource`, and `@MCPPrompt` decorators
- 🔄 **Auto-discovery**: Automatically discovers and registers tools, resources, and prompts
- 🌐 **HTTP/JSON-RPC Support**: Built-in HTTP controller for MCP protocol
- 📦 **Official SDK Integration**: Powered by `@modelcontextprotocol/sdk` v1.21.1 with modern `McpServer` API
- 🔧 **TypeScript First**: Full type safety and IntelliSense support with Zod schema validation
- 🎨 **Flexible Configuration**: Sync and async module configuration options
- 🚀 **Production Ready**: Built with NestJS best practices and latest MCP SDK patterns

## Installation

```bash
npm install nestjs-mcp
```

## Quick Start

### 1. Import the Module

```typescript
import { Module } from '@nestjs/common';
import { MCPModule } from 'nestjs-mcp';

@Module({
    imports: [
        MCPModule.forRoot({
            serverInfo: {
                name: 'My MCP Server',
                version: '1.0.0',
                capabilities: {
                    tools: { listChanged: true },
                    resources: { subscribe: true },
                    prompts: { listChanged: true },
                },
            },
            autoDiscoverTools: true,
            autoDiscoverResources: true,
            autoDiscoverPrompts: true,
            enableLogging: true,
        }),
    ],
})
export class AppModule {}
```

### 2. Create MCP Tools

```typescript
import { Injectable } from '@nestjs/common';
import { MCPTool, MCPToolWithParams } from 'nestjs-mcp';

@Injectable()
export class CalculatorService {
    @MCPToolWithParams({
        name: 'add',
        description: 'Add two numbers',
        parameters: [
            {
                name: 'a',
                type: 'number',
                description: 'First number',
                required: true,
            },
            {
                name: 'b',
                type: 'number',
                description: 'Second number',
                required: true,
            },
        ],
    })
    async add(params: { a: number; b: number }): Promise<number> {
        return params.a + params.b;
    }

    @MCPTool({
        name: 'reverse-string',
        description: 'Reverse a string',
    })
    async reverseString(params: { text: string }): Promise<string> {
        return params.text.split('').reverse().join('');
    }
}
```

### 3. Create MCP Resources

```typescript
import { Injectable } from '@nestjs/common';
import { MCPResource, MCPResourceTemplate } from 'nestjs-mcp';

@Injectable()
export class FileService {
    // Static resource
    @MCPResource({
        uri: 'file:///readme.txt',
        name: 'README',
        description: 'Application README file',
        mimeType: 'text/plain',
    })
    async getReadme() {
        return {
            uri: 'file:///readme.txt',
            mimeType: 'text/plain',
            text: 'Welcome to MCP!',
        };
    }

    // Dynamic resource with URI template
    @MCPResourceTemplate({
        uriTemplate: 'file:///{filename}',
        name: 'Dynamic File',
        description: 'Get any file by name',
        mimeType: 'text/plain',
    })
    async getFile(variables: { filename: string }) {
        // Variables are extracted from URI pattern
        return {
            uri: `file:///${variables.filename}`,
            mimeType: 'text/plain',
            text: `Content of ${variables.filename}`,
        };
    }
}
```

### 4. Create MCP Prompts

```typescript
import { Injectable } from '@nestjs/common';
import { MCPPrompt } from 'nestjs-mcp';

@Injectable()
export class PromptService {
    @MCPPrompt({
        name: 'code-review',
        description: 'Generate a code review prompt',
        arguments: [
            {
                name: 'language',
                description: 'Programming language',
                required: true,
            },
            { name: 'code', description: 'Code to review', required: true },
        ],
    })
    async codeReview(args: { language: string; code: string }) {
        return [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `Please review this ${args.language} code:\n\n${args.code}`,
                },
            },
        ];
    }
}
```

## Transport Options

### HTTP Transport (Default)

Once configured, your NestJS application will expose the following endpoints:

- **POST** `/mcp` - Main MCP JSON-RPC endpoint
- **POST** `/mcp/batch` - Batch request endpoint

#### Example Request

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### Stdio Transport

For CLI or local integrations, you can use stdio transport:

```typescript
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MCPSDKService } from 'nestjs-mcp';

@Injectable()
export class AppService implements OnApplicationBootstrap {
    constructor(private readonly mcpSdkService: MCPSDKService) {}

    async onApplicationBootstrap() {
        // Connect to stdio transport for CLI usage
        await this.mcpSdkService.connectStdio();
    }
}
```

This is useful when your MCP server needs to communicate via standard input/output (e.g., when launched by Claude Desktop or other MCP clients).

## Configuration Options

### MCPModuleOptions

```typescript
interface MCPModuleOptions {
    serverInfo: {
        name: string;
        version: string;
        capabilities?: MCPServerCapabilities;
    };
    autoDiscoverTools?: boolean; // Default: true
    autoDiscoverResources?: boolean; // Default: true
    autoDiscoverPrompts?: boolean; // Default: true
    globalPrefix?: string; // Default: 'mcp'
    enableLogging?: boolean; // Default: false
    errorHandler?: (error: Error) => any;
}
```

### Server Capabilities

Configure what features your MCP server supports:

```typescript
{
  capabilities: {
    tools: {
      listChanged: true,  // Notify clients when tools list changes
    },
    resources: {
      subscribe: true,     // Support resource subscriptions
      listChanged: true,   // Notify clients when resources list changes
    },
    prompts: {
      listChanged: true,   // Notify clients when prompts list changes
    },
    logging: {},           // Enable logging support
    experimental: {},      // Experimental features
    completions: {},       // Completion support
  }
}
```

### Async Configuration

```typescript
MCPModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
        serverInfo: {
            name: configService.get('MCP_SERVER_NAME'),
            version: configService.get('MCP_SERVER_VERSION'),
        },
        enableLogging: true,
    }),
    inject: [ConfigService],
});
```

## Decorators

### @MCPTool

Mark a method as an MCP tool (parameters are passed as a single object):

```typescript
@MCPTool({
  name: 'tool-name',
  description: 'Tool description',
})
async myTool(params: { text: string }) {
  return `Result: ${params.text}`;
}
```

### @MCPToolWithParams

Define a tool with explicit parameter schemas (uses Zod validation):

```typescript
@MCPToolWithParams({
  name: 'tool-name',
  description: 'Tool description',
  parameters: [
    { name: 'text', type: 'string', description: 'Input text', required: true },
    { name: 'count', type: 'number', description: 'Repeat count', required: false, default: 1 },
  ],
})
async myTool(params: { text: string; count?: number }) {
  return `Result: ${params.text.repeat(params.count || 1)}`;
}
```

### @MCPResource

Define a static resource:

```typescript
@MCPResource({
  uri: 'resource:///config',
  name: 'Config',
  description: 'Application configuration',
  mimeType: 'application/json',
})
async getConfig() {
  return { uri: 'resource:///config', text: JSON.stringify({ version: '1.0' }) };
}
```

### @MCPResourceTemplate

Define a dynamic resource with URI template:

```typescript
@MCPResourceTemplate({
  uriTemplate: 'resource:///{type}/{id}',
  name: 'Dynamic Resource',
  description: 'Get resource by type and ID',
  mimeType: 'application/json',
})
async getResource(variables: { type: string; id: string }) {
  return {
    uri: `resource:///${variables.type}/${variables.id}`,
    text: `Resource ${variables.id} of type ${variables.type}`
  };
}
```

### @MCPPrompt

Define a prompt template:

```typescript
@MCPPrompt({
  name: 'prompt-name',
  description: 'Prompt description',
  arguments: [{ name: 'topic', description: 'Topic to discuss', required: true }],
})
async getPrompt(args: { topic: string }) {
  return [{
    role: 'user',
    content: { type: 'text', text: `Let's discuss ${args.topic}` }
  }];
}
```

## Architecture

This package integrates the official `@modelcontextprotocol/sdk` v1.21.1 with NestJS:

- **MCPSDKService**: Wraps the modern `McpServer` class from the SDK
    - Uses Zod schemas for parameter validation
    - Automatically converts decorator metadata to SDK-compatible formats
    - Handles tool, resource, and prompt registration with the SDK
- **MCPService**: Provides HTTP/JSON-RPC compatibility layer for web clients
- **MCPRegistryService**: Central registry for managing tool/resource/prompt definitions
- **MCPDiscoveryService**: Auto-discovers and registers decorated methods at startup
- **MCPController**: HTTP endpoints for MCP protocol communication
- **MCPModule**: NestJS dynamic module for easy integration

### SDK Integration

The package uses the latest `McpServer` API from `@modelcontextprotocol/sdk`:

- ✅ Modern high-level API with clean registration methods
- ✅ Built-in Zod validation for type safety
- ✅ Support for stdio and HTTP transports
- ✅ Full compatibility with MCP specification

## License

MIT
