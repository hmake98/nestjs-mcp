# nestjs-mcp

![Statements](https://img.shields.io/badge/statements-98.65%25-brightgreen.svg?style=flat) ![Branches](https://img.shields.io/badge/branches-86.75%25-yellow.svg?style=flat) ![Functions](https://img.shields.io/badge/functions-97.61%25-brightgreen.svg?style=flat) ![Lines](https://img.shields.io/badge/lines-98.62%25-brightgreen.svg?style=flat)

A NestJS library for integrating the Model Context Protocol (MCP) into your applications. Built on top of the official [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) v1.21.1, this package provides a decorator-based approach to building MCP servers with NestJS.

> 📚 **[View Complete Working Example →](./examples/basic/)**

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Decorators](#decorators)
- [Versioning & Deprecation](#versioning--deprecation)
- [Transport Options](#transport-options)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🎯 **Decorator-based API**: Use `@MCPTool`, `@MCPToolWithParams`, `@MCPResource`, `@MCPResourceTemplate`, and `@MCPPrompt` decorators
- 🔄 **Auto-discovery**: Automatically discovers and registers tools, resources, and prompts from your providers
- 🌐 **HTTP/JSON-RPC Support**: Built-in HTTP controller for MCP protocol communication
- 📦 **Official SDK Integration**: Powered by `@modelcontextprotocol/sdk` v1.21.1 with modern `McpServer` API
- 🔧 **TypeScript First**: Full type safety and IntelliSense support with Zod schema validation
- 📌 **Versioning & Deprecation**: Track versions and manage API evolution with built-in deprecation support
- 🎨 **Flexible Configuration**: Sync and async module configuration options
- 📝 **Logging Support**: Configurable log levels (error, warn, info, debug, verbose)
- 🚀 **Production Ready**: Built with NestJS best practices and comprehensive test coverage

## Installation

```bash
npm install nestjs-mcp
# or
yarn add nestjs-mcp
# or
pnpm add nestjs-mcp
```

### Peer Dependencies

This package requires the following peer dependencies:

```json
{
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0"
}
```

## Quick Start

### 1. Import the Module

Import and configure the `MCPModule` in your application module:

```typescript
import { Module } from '@nestjs/common';
import { MCPModule } from 'nestjs-mcp';

@Module({
    imports: [
        MCPModule.forRoot({
            serverInfo: {
                name: 'my-mcp-server',
                version: '1.0.0',
            },
            autoDiscoverTools: true, // Default: true
            autoDiscoverResources: true, // Default: true
            autoDiscoverPrompts: true, // Default: true
            logLevel: 'info', // Default: 'info'
        }),
    ],
})
export class AppModule {}
```

### 2. Create MCP Tools

Create a service with MCP tool methods using decorators:

```typescript
import { Injectable } from '@nestjs/common';
import { MCPTool, MCPToolWithParams } from 'nestjs-mcp';

@Injectable()
export class CalculatorService {
    // Simple tool with automatic parameter inference
    @MCPTool({
        name: 'add',
        description: 'Add two numbers',
    })
    async add(params: { a: number; b: number }): Promise<number> {
        return params.a + params.b;
    }

    // Tool with explicit parameter definitions and validation
    @MCPToolWithParams({
        name: 'multiply',
        description: 'Multiply two numbers',
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
    async multiply(params: { a: number; b: number }): Promise<number> {
        return params.a * params.b;
    }

    // Return structured tool results
    @MCPTool({
        name: 'format-result',
        description: 'Format calculation result',
    })
    async formatResult(params: { value: number }) {
        return {
            content: [
                {
                    type: 'text' as const,
                    text: `The result is: ${params.value}`,
                },
            ],
        };
    }
}
```

**Important**: Register the service in your module's providers:

```typescript
@Module({
    imports: [
        MCPModule.forRoot({
            /* ... */
        }),
    ],
    providers: [CalculatorService],
})
export class AppModule {}
```

### 3. Create MCP Resources

Resources provide access to data or content. Create static or dynamic resources:

```typescript
import { Injectable } from '@nestjs/common';
import { MCPResource, MCPResourceTemplate } from 'nestjs-mcp';

@Injectable()
export class FileService {
    // Static resource - fixed URI
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
            text: 'Welcome to my MCP server!',
        };
    }

    // Dynamic resource with URI template
    // Matches URIs like: file:///documents/report.pdf
    @MCPResourceTemplate({
        uriTemplate: 'file:///{filename}',
        name: 'File',
        description: 'Access any file by filename',
        mimeType: 'text/plain',
    })
    async getFile(variables: { filename: string }) {
        // Variables are automatically extracted from the URI
        const content = await this.readFile(variables.filename);

        return {
            uri: `file:///${variables.filename}`,
            mimeType: 'text/plain',
            text: content,
        };
    }

    // Advanced template with multiple variables
    // Matches URIs like: resource:///user/123/profile
    @MCPResourceTemplate({
        uriTemplate: 'resource:///{type}/{id}',
        name: 'Dynamic Resource',
        description: 'Get resource by type and ID',
        mimeType: 'application/json',
    })
    async getResource(variables: { type: string; id: string }) {
        const data = await this.fetchResourceData(variables.type, variables.id);

        return {
            uri: `resource:///${variables.type}/${variables.id}`,
            mimeType: 'application/json',
            text: JSON.stringify(data),
        };
    }

    private async readFile(filename: string): Promise<string> {
        // Your file reading logic here
        return `Content of ${filename}`;
    }

    private async fetchResourceData(type: string, id: string) {
        // Your data fetching logic here
        return { type, id, data: '...' };
    }
}
```

### 4. Create MCP Prompts

Prompts provide reusable message templates for AI interactions:

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
            {
                name: 'code',
                description: 'Code to review',
                required: true,
            },
        ],
    })
    async codeReview(args: { language: string; code: string }) {
        return [
            {
                role: 'user' as const,
                content: {
                    type: 'text' as const,
                    text: `Please review this ${args.language} code:\n\n${args.code}`,
                },
            },
        ];
    }

    @MCPPrompt({
        name: 'summarize',
        description: 'Summarize content with custom length',
        arguments: [
            {
                name: 'content',
                description: 'Content to summarize',
                required: true,
            },
            {
                name: 'length',
                description: 'Summary length (short, medium, long)',
                required: false,
            },
        ],
    })
    async summarize(args: { content: string; length?: string }) {
        const lengthInstruction = args.length
            ? `in ${args.length} form`
            : 'concisely';

        return [
            {
                role: 'user' as const,
                content: {
                    type: 'text' as const,
                    text: `Please summarize the following content ${lengthInstruction}:\n\n${args.content}`,
                },
            },
        ];
    }
}
```

## Configuration

### Module Options

The `MCPModuleOptions` interface provides the following configuration options:

```typescript
interface MCPModuleOptions {
    // Server information (required)
    serverInfo: {
        name: string; // Server name
        version: string; // Server version
        capabilities?: {
            // Server capabilities (optional)
            tools?: {
                listChanged?: boolean;
            };
            resources?: {
                subscribe?: boolean;
                listChanged?: boolean;
            };
            prompts?: {
                listChanged?: boolean;
            };
            logging?: {};
            experimental?: {};
            completions?: {};
        };
    };

    // Auto-discovery settings
    autoDiscoverTools?: boolean; // Default: true
    autoDiscoverResources?: boolean; // Default: true
    autoDiscoverPrompts?: boolean; // Default: true

    // HTTP endpoint configuration
    globalPrefix?: string; // Default: 'mcp'

    // Logging configuration
    logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'verbose'; // Default: 'info'
    enableLogging?: boolean; // Deprecated: use logLevel instead

    // Error handling
    errorHandler?: (error: Error) => any;
}
```

### Synchronous Configuration

Basic module registration with inline options:

```typescript
import { Module } from '@nestjs/common';
import { MCPModule } from 'nestjs-mcp';

@Module({
    imports: [
        MCPModule.forRoot({
            serverInfo: {
                name: 'my-mcp-server',
                version: '1.0.0',
                capabilities: {
                    tools: { listChanged: true },
                    resources: { subscribe: true, listChanged: true },
                    prompts: { listChanged: true },
                },
            },
            logLevel: 'debug',
            globalPrefix: 'api/mcp', // Changes endpoint to /api/mcp
        }),
    ],
})
export class AppModule {}
```

### Asynchronous Configuration

For dynamic configuration using environment variables or config services:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MCPModule } from 'nestjs-mcp';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MCPModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                serverInfo: {
                    name: configService.get(
                        'MCP_SERVER_NAME',
                        'default-server',
                    ),
                    version: configService.get('MCP_SERVER_VERSION', '1.0.0'),
                },
                logLevel: configService.get('MCP_LOG_LEVEL', 'info'),
                autoDiscoverTools: true,
                autoDiscoverResources: true,
                autoDiscoverPrompts: true,
            }),
            inject: [ConfigService],
        }),
    ],
})
export class AppModule {}
```

### Using `useClass` for Async Configuration

```typescript
import { Injectable } from '@nestjs/common';
import { MCPOptionsFactory, MCPModuleOptions } from 'nestjs-mcp';

@Injectable()
export class MCPConfigService implements MCPOptionsFactory {
    createMCPOptions(): MCPModuleOptions {
        return {
            serverInfo: {
                name: 'my-mcp-server',
                version: '1.0.0',
            },
            logLevel: 'info',
        };
    }
}

@Module({
    imports: [
        MCPModule.forRootAsync({
            useClass: MCPConfigService,
        }),
    ],
})
export class AppModule {}
```

### Feature Module Registration

Use `forFeature()` when you want to use MCP services without exposing HTTP endpoints:

```typescript
import { Module } from '@nestjs/common';
import { MCPModule } from 'nestjs-mcp';

@Module({
    imports: [MCPModule.forFeature()],
    providers: [MyService],
})
export class FeatureModule {
    // This module can inject MCPService, MCPRegistryService, etc.
    // but won't expose the /mcp HTTP endpoints
}
```

## Decorators

### `@MCPTool`

Marks a method as an MCP tool. Parameters are passed as a single object.

```typescript
@MCPTool({
  name: string;           // Tool name (required)
  description: string;    // Tool description (required)
})
async myTool(params: { [key: string]: any }) {
  // Implementation
}
```

**Example:**

```typescript
@MCPTool({
  name: 'get-weather',
  description: 'Get weather information for a location',
})
async getWeather(params: { location: string }) {
  const weather = await this.weatherService.fetch(params.location);
  return `Weather in ${params.location}: ${weather}`;
}
```

### `@MCPToolWithParams`

Defines a tool with explicit parameter schemas and automatic validation using Zod.

```typescript
@MCPToolWithParams({
  name: string;           // Tool name (required)
  description: string;    // Tool description (required)
  parameters: Array<{     // Parameter definitions (required)
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description?: string;
    required?: boolean;
    default?: any;
    enum?: any[];
  }>;
})
async myTool(params: { [key: string]: any }) {
  // Implementation
}
```

**Example:**

```typescript
@MCPToolWithParams({
  name: 'search',
  description: 'Search for items',
  parameters: [
    {
      name: 'query',
      type: 'string',
      description: 'Search query',
      required: true,
    },
    {
      name: 'limit',
      type: 'number',
      description: 'Maximum results',
      required: false,
      default: 10,
    },
    {
      name: 'sortBy',
      type: 'string',
      description: 'Sort field',
      required: false,
      enum: ['name', 'date', 'relevance'],
    },
  ],
})
async search(params: { query: string; limit?: number; sortBy?: string }) {
  return this.searchService.search(params);
}
```

### `@MCPResource`

Defines a static resource with a fixed URI.

```typescript
@MCPResource({
  uri: string;            // Resource URI (required)
  name: string;           // Resource name (required)
  description?: string;   // Resource description
  mimeType?: string;      // MIME type
})
async getResource(): Promise<{
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}> {
  // Return resource content
}
```

**Example:**

```typescript
@MCPResource({
  uri: 'config://app/settings',
  name: 'App Settings',
  description: 'Application configuration',
  mimeType: 'application/json',
})
async getSettings() {
  const settings = await this.configService.getAll();
  return {
    uri: 'config://app/settings',
    mimeType: 'application/json',
    text: JSON.stringify(settings, null, 2),
  };
}
```

### `@MCPResourceTemplate`

Defines a dynamic resource with URI template for pattern matching.

```typescript
@MCPResourceTemplate({
  uriTemplate: string;    // URI template with {variables} (required)
  name: string;           // Resource name (required)
  description?: string;   // Resource description
  mimeType?: string;      // MIME type
})
async getResource(variables: { [key: string]: string }): Promise<{
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}> {
  // Variables are automatically extracted from the URI
}
```

**Example:**

```typescript
@MCPResourceTemplate({
  uriTemplate: 'user:///{userId}/profile',
  name: 'User Profile',
  description: 'Get user profile by ID',
  mimeType: 'application/json',
})
async getUserProfile(variables: { userId: string }) {
  const profile = await this.userService.findById(variables.userId);
  return {
    uri: `user:///${variables.userId}/profile`,
    mimeType: 'application/json',
    text: JSON.stringify(profile),
  };
}
```

**URI Template Syntax:**

- Use `{variableName}` to define variables
- Example: `file:///{folder}/{filename}` matches `file:///documents/report.pdf`
- Variables are extracted and passed to your handler method

### `@MCPPrompt`

Defines a prompt template for AI interactions.

```typescript
@MCPPrompt({
  name: string;           // Prompt name (required)
  description?: string;   // Prompt description
  arguments?: Array<{     // Prompt arguments
    name: string;
    description?: string;
    required?: boolean;
  }>;
})
async getPrompt(args: { [key: string]: any }): Promise<Array<{
  role: 'user' | 'assistant';
  content: {
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  };
}>> {
  // Return prompt messages
}
```

**Example:**

```typescript
@MCPPrompt({
  name: 'explain-code',
  description: 'Generate a prompt to explain code',
  arguments: [
    { name: 'code', description: 'Code to explain', required: true },
    { name: 'language', description: 'Programming language', required: true },
    { name: 'level', description: 'Explanation level', required: false },
  ],
})
async explainCode(args: { code: string; language: string; level?: string }) {
  const level = args.level || 'intermediate';
  return [
    {
      role: 'user' as const,
      content: {
        type: 'text' as const,
        text: `Explain this ${args.language} code at a ${level} level:\n\n${args.code}`,
      },
    },
  ];
}
```

## Versioning & Deprecation

The library supports versioning and deprecation tracking for tools, resources, and prompts. This helps you manage API evolution and provide clear migration paths for consumers.

### Version Tracking

Add a `version` field to any decorator to track the version of your MCP items:

```typescript
@MCPTool({
    name: 'data-processor',
    description: 'Process data with advanced algorithms',
    schema: z.object({ data: z.string() }),
    version: '2.0.0', // Add version information
})
async processData({ data }: { data: string }) {
    return { processed: this.processV2(data) };
}
```

### Deprecation Support

Mark items as deprecated with detailed migration information:

```typescript
@MCPTool({
    name: 'legacy-calculator',
    description: 'Old calculation method',
    schema: z.object({ value: z.number() }),
    version: '1.0.0',
    deprecation: {
        deprecated: true,
        message: 'This tool uses outdated algorithms',
        since: '1.5.0',
        removeIn: '3.0.0',
        replacedBy: 'advanced-calculator',
    },
})
async legacyCalculate({ value }: { value: number }) {
    return value * 2;
}
```

### Deprecation Options

```typescript
deprecation?: {
  deprecated: boolean;      // Whether the item is deprecated (required)
  message?: string;         // Custom deprecation message
  since?: string;           // Version when deprecated
  removeIn?: string;        // Version when it will be removed
  replacedBy?: string;      // Name of replacement item
}
```

### Runtime Behavior

When deprecated items are used:

1. **Automatic Warnings**: The library logs a warning when a deprecated item is called
2. **Client Information**: Deprecation details are included in list responses
3. **Continued Functionality**: Deprecated items still work normally

**Example Deprecation Warning:**

```
[Warn] Tool 'legacy-calculator' is deprecated. This tool uses outdated algorithms. Deprecated since 1.5.0. Will be removed in 3.0.0. Use 'advanced-calculator' instead.
```

### List Response with Version/Deprecation

When clients list tools, resources, or prompts, they receive version and deprecation information:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "advanced-calculator",
        "description": "Modern calculation algorithms",
        "inputSchema": {...},
        "version": "2.0.0"
      },
      {
        "name": "legacy-calculator",
        "description": "Old calculation method",
        "inputSchema": {...},
        "version": "1.0.0",
        "deprecated": true,
        "deprecationMessage": "This tool uses outdated algorithms. Deprecated since 1.5.0. Will be removed in 3.0.0. Use 'advanced-calculator' instead."
      }
    ]
  }
}
```

### Full Example with All MCP Types

```typescript
@Injectable()
export class VersionedService {
    // Current tool
    @MCPTool({
        name: 'current-api',
        description: 'Latest API version',
        schema: z.object({ input: z.string() }),
        version: '3.0.0',
    })
    async currentApi({ input }: { input: string }) {
        return { result: this.processV3(input) };
    }

    // Deprecated tool
    @MCPTool({
        name: 'legacy-api',
        description: 'Legacy API endpoint',
        schema: z.object({ input: z.string() }),
        version: '1.0.0',
        deprecation: {
            deprecated: true,
            message: 'Use the new API for better performance',
            since: '2.0.0',
            removeIn: '4.0.0',
            replacedBy: 'current-api',
        },
    })
    async legacyApi({ input }: { input: string }) {
        return { result: this.processV1(input) };
    }

    // Deprecated resource
    @MCPResource({
        uri: 'file://old-config',
        name: 'Old Configuration',
        description: 'Legacy configuration format',
        version: '1.0.0',
        deprecation: {
            deprecated: true,
            message: 'Configuration format has been updated',
            since: '2.0.0',
            replacedBy: 'file://new-config',
        },
    })
    async getOldConfig() {
        return {
            uri: 'file://old-config',
            mimeType: 'application/json',
            text: JSON.stringify({ legacy: true }),
        };
    }

    // Deprecated prompt
    @MCPPrompt({
        name: 'old-prompt-template',
        description: 'Legacy prompt structure',
        schema: z.object({ topic: z.string() }),
        version: '1.0.0',
        deprecation: {
            deprecated: true,
            message: 'Prompt format has been improved',
            since: '1.5.0',
            removeIn: '2.0.0',
            replacedBy: 'new-prompt-template',
        },
    })
    async getOldPrompt({ topic }: { topic: string }) {
        return [
            {
                role: 'user' as const,
                content: {
                    type: 'text' as const,
                    text: `Tell me about ${topic}`,
                },
            },
        ];
    }
}
```

### Best Practices

1. **Semantic Versioning**: Use semver format (e.g., `1.0.0`, `2.1.3`) for consistency
2. **Clear Messages**: Provide helpful deprecation messages explaining why and what to use instead
3. **Grace Period**: Give users time to migrate by specifying `removeIn` version
4. **Documentation**: Always specify `replacedBy` when there's a direct replacement
5. **Gradual Migration**: Don't remove deprecated items immediately; keep them for several versions

## Transport Options

### HTTP Transport (Default)

Once configured, your NestJS application exposes JSON-RPC endpoints for MCP communication:

**Endpoints:**

- **POST** `/mcp` - Main MCP JSON-RPC endpoint
- **POST** `/mcp/batch` - Batch request endpoint (multiple requests in one call)

**Available Methods:**

- `initialize` - Initialize the MCP connection
- `tools/list` - List all available tools
- `tools/call` - Call a specific tool
- `resources/list` - List all available resources
- `resources/read` - Read a specific resource
- `prompts/list` - List all available prompts
- `prompts/get` - Get a specific prompt
- `ping` - Health check

**Example Requests:**

```bash
# List all tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'

# Call a tool
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "add",
      "arguments": {
        "a": 5,
        "b": 3
      }
    }
  }'

# Batch request
curl -X POST http://localhost:3000/mcp/batch \
  -H "Content-Type: application/json" \
  -d '[
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "tools/list"
    },
    {
      "jsonrpc": "2.0",
      "id": 2,
      "method": "resources/list"
    }
  ]'
```

### Stdio Transport

For CLI tools or desktop applications (like Claude Desktop), use stdio transport:

```typescript
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MCPSDKService } from 'nestjs-mcp';

@Injectable()
export class AppService implements OnApplicationBootstrap {
    constructor(private readonly mcpSdkService: MCPSDKService) {}

    async onApplicationBootstrap() {
        // Connect to stdio transport for CLI/desktop app usage
        await this.mcpSdkService.connectStdio();
    }
}
```

This enables your MCP server to communicate via standard input/output, which is useful for:

- Claude Desktop integration
- Command-line tools
- Local MCP clients
- Development and testing

## API Reference

### Services

#### MCPService

Core service for handling MCP protocol requests.

```typescript
import { MCPService } from 'nestjs-mcp';

@Injectable()
export class MyService {
    constructor(private readonly mcpService: MCPService) {}

    async handleCustomRequest(request: MCPRequest) {
        return this.mcpService.handleRequest(request);
    }
}
```

**Methods:**

- `handleRequest(request: MCPRequest): Promise<MCPResponse>` - Process MCP protocol requests
- `handleBatchRequest(requests: MCPRequest[]): Promise<MCPResponse[]>` - Process multiple requests

#### MCPRegistryService

Registry for managing tools, resources, and prompts.

```typescript
import { MCPRegistryService } from 'nestjs-mcp';

@Injectable()
export class MyService {
    constructor(private readonly registryService: MCPRegistryService) {}

    listTools() {
        return this.registryService.getTools();
    }

    getTool(name: string) {
        return this.registryService.getTool(name);
    }
}
```

**Methods:**

- `registerTool(tool: MCPToolDefinition): void` - Register a new tool
- `getTool(name: string): MCPToolDefinition | undefined` - Get a tool by name
- `getTools(): MCPToolDefinition[]` - Get all registered tools
- `registerResource(resource: DiscoveredMCPResource): void` - Register a new resource
- `getResource(uri: string): DiscoveredMCPResource | undefined` - Get a resource by URI
- `getResources(): DiscoveredMCPResource[]` - Get all registered resources
- `registerPrompt(prompt: DiscoveredMCPPrompt): void` - Register a new prompt
- `getPrompt(name: string): DiscoveredMCPPrompt | undefined` - Get a prompt by name
- `getPrompts(): DiscoveredMCPPrompt[]` - Get all registered prompts

#### MCPSDKService

Low-level service wrapping the official `@modelcontextprotocol/sdk`.

```typescript
import { MCPSDKService } from 'nestjs-mcp';

@Injectable()
export class MyService {
    constructor(private readonly sdkService: MCPSDKService) {}

    async connectToStdio() {
        await this.sdkService.connectStdio();
    }
}
```

**Methods:**

- `connectStdio(): Promise<void>` - Connect to stdio transport
- `getServer(): McpServer` - Get the underlying McpServer instance

#### MCPDiscoveryService

Service for discovering decorated methods.

```typescript
import { MCPDiscoveryService } from 'nestjs-mcp';

@Injectable()
export class MyService {
    constructor(private readonly discoveryService: MCPDiscoveryService) {}

    discoverAll() {
        const tools = this.discoveryService.discoverTools();
        const resources = this.discoveryService.discoverResources();
        const prompts = this.discoveryService.discoverPrompts();
        return { tools, resources, prompts };
    }
}
```

**Methods:**

- `discoverTools(): MCPToolDefinition[]` - Discover all tools
- `discoverResources(): DiscoveredMCPResource[]` - Discover all resources
- `discoverPrompts(): DiscoveredMCPPrompt[]` - Discover all prompts

### Types and Interfaces

#### MCPRequest

```typescript
interface MCPRequest<P = JSONObject> {
    jsonrpc: '2.0';
    id: string | number;
    method: string;
    params?: P;
}
```

#### MCPResponse

```typescript
interface MCPResponse {
    jsonrpc: '2.0';
    id: string | number;
    result?: unknown;
    error?: MCPError;
}
```

#### MCPToolResult

```typescript
interface MCPToolResult {
    content: Array<{
        type: 'text' | 'image' | 'resource';
        text?: string;
        data?: string;
        mimeType?: string;
    }>;
    isError?: boolean;
}
```

## Architecture

This package integrates the official `@modelcontextprotocol/sdk` v1.21.1 with NestJS using a layered architecture:

```
┌─────────────────────────────────────────┐
│         NestJS Application              │
│  (Your controllers, services, etc.)     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          MCPModule                      │
│  ┌─────────────────────────────────┐   │
│  │    @MCPTool                     │   │
│  │    @MCPResource                 │   │
│  │    @MCPPrompt                   │   │
│  │    (Decorators)                 │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│  ┌──────────────▼──────────────────┐   │
│  │  MCPDiscoveryService            │   │
│  │  (Auto-discover decorated       │   │
│  │   methods at startup)           │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│  ┌──────────────▼──────────────────┐   │
│  │  MCPRegistryService             │   │
│  │  (Central registry for tools,   │   │
│  │   resources, and prompts)       │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│  ┌──────────────▼──────────────────┐   │
│  │  MCPSDKService                  │   │
│  │  (Wraps @modelcontextprotocol/  │   │
│  │   sdk McpServer)                │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│  ┌──────────────▼──────────────────┐   │
│  │  MCPService                     │   │
│  │  (HTTP/JSON-RPC handler)        │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│  ┌──────────────▼──────────────────┐   │
│  │  MCPController                  │   │
│  │  (HTTP endpoints: /mcp,         │   │
│  │   /mcp/batch)                   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│   @modelcontextprotocol/sdk             │
│   (Official MCP SDK v1.21.1)            │
└─────────────────────────────────────────┘
```

### Component Responsibilities

- **Decorators**: Mark methods for auto-discovery
- **MCPDiscoveryService**: Scans providers for decorated methods using NestJS's `DiscoveryService`, `MetadataScanner`, and `Reflector`
- **MCPRegistryService**: In-memory registry storing tool, resource, and prompt definitions
- **MCPSDKService**: Wraps the official SDK's `McpServer` class, handles Zod schema conversion and validation
- **MCPService**: Provides HTTP/JSON-RPC compatibility layer for web clients
- **MCPController**: Exposes HTTP endpoints (`/mcp`, `/mcp/batch`) for protocol communication
- **MCPModule**: Dynamic module orchestrating all services and handling configuration

### SDK Integration

The package uses the modern `McpServer` API from `@modelcontextprotocol/sdk`:

- ✅ High-level API with clean registration methods
- ✅ Built-in Zod validation for type safety
- ✅ Support for stdio and custom transports
- ✅ Full compatibility with MCP specification 2024-11-05

## Examples

### 🎯 Running Example

A complete, working example is available in the [`examples/basic`](./examples/basic/) directory. This demonstrates:

- ✅ Tools (calculator operations, string manipulation)
- ✅ Static and dynamic resources with URI templates
- ✅ Reusable prompt templates
- ✅ Complete NestJS application setup

**Quick Start:**

```bash
# Build the library
npm install && npm run build

# Run the example
cd examples/basic
npm install
npm start
```

Then test it:

```bash
# List all tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

See the [example README](./examples/basic/README.md) for detailed usage instructions.

### Complete Application Example (Code Snippets)

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MCPModule } from 'nestjs-mcp';
import { ToolsService } from './tools.service';
import { ResourcesService } from './resources.service';
import { PromptsService } from './prompts.service';

@Module({
    imports: [
        MCPModule.forRoot({
            serverInfo: {
                name: 'my-awesome-mcp-server',
                version: '1.0.0',
                capabilities: {
                    tools: { listChanged: true },
                    resources: { subscribe: true, listChanged: true },
                    prompts: { listChanged: true },
                },
            },
            logLevel: 'debug',
        }),
    ],
    providers: [ToolsService, ResourcesService, PromptsService],
})
export class AppModule {}

// tools.service.ts
import { Injectable } from '@nestjs/common';
import { MCPToolWithParams } from 'nestjs-mcp';

@Injectable()
export class ToolsService {
    @MCPToolWithParams({
        name: 'calculate',
        description: 'Perform basic calculations',
        parameters: [
            {
                name: 'operation',
                type: 'string',
                required: true,
                enum: ['add', 'subtract', 'multiply', 'divide'],
            },
            { name: 'a', type: 'number', required: true },
            { name: 'b', type: 'number', required: true },
        ],
    })
    async calculate(params: { operation: string; a: number; b: number }) {
        switch (params.operation) {
            case 'add':
                return params.a + params.b;
            case 'subtract':
                return params.a - params.b;
            case 'multiply':
                return params.a * params.b;
            case 'divide':
                return params.a / params.b;
            default:
                throw new Error('Invalid operation');
        }
    }
}

// resources.service.ts
import { Injectable } from '@nestjs/common';
import { MCPResourceTemplate } from 'nestjs-mcp';

@Injectable()
export class ResourcesService {
    @MCPResourceTemplate({
        uriTemplate: 'data:///{collection}/{id}',
        name: 'Data Item',
        description: 'Get data item by collection and ID',
        mimeType: 'application/json',
    })
    async getDataItem(variables: { collection: string; id: string }) {
        // Fetch from database
        const item = await this.fetchFromDB(variables.collection, variables.id);
        return {
            uri: `data:///${variables.collection}/${variables.id}`,
            mimeType: 'application/json',
            text: JSON.stringify(item),
        };
    }

    private async fetchFromDB(collection: string, id: string) {
        // Your database logic here
        return { collection, id, data: 'example' };
    }
}

// prompts.service.ts
import { Injectable } from '@nestjs/common';
import { MCPPrompt } from 'nestjs-mcp';

@Injectable()
export class PromptsService {
    @MCPPrompt({
        name: 'analyze-data',
        description: 'Generate a data analysis prompt',
        arguments: [
            { name: 'dataset', description: 'Dataset name', required: true },
            {
                name: 'metric',
                description: 'Metric to analyze',
                required: true,
            },
        ],
    })
    async analyzeData(args: { dataset: string; metric: string }) {
        return [
            {
                role: 'user' as const,
                content: {
                    type: 'text' as const,
                    text: `Analyze the ${args.metric} metric from the ${args.dataset} dataset.`,
                },
            },
        ];
    }
}

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
    console.log('MCP Server running on http://localhost:3000/mcp');
}
bootstrap();
```

### Testing Your MCP Server

```bash
# List all tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Call a tool
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/call",
    "params":{
      "name":"calculate",
      "arguments":{"operation":"add","a":10,"b":5}
    }
  }'

# List resources
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"resources/list"}'

# Read a resource
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":4,
    "method":"resources/read",
    "params":{"uri":"data:///users/123"}
  }'
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run linting (`npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/hmake98/nestjs-mcp.git
cd nestjs-mcp

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:ci

# Build the package
npm run build

# Lint and format
npm run fix-all
```

## License

MIT
