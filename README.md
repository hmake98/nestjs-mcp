# @hmake98/nestjs-mcp

![Statements](https://img.shields.io/badge/statements-98.66%25-brightgreen.svg?style=flat) ![Branches](https://img.shields.io/badge/branches-92.06%25-brightgreen.svg?style=flat) ![Functions](https://img.shields.io/badge/functions-98.07%25-brightgreen.svg?style=flat) ![Lines](https://img.shields.io/badge/lines-98.66%25-brightgreen.svg?style=flat)

A NestJS library for integrating the Model Context Protocol (MCP) into your applications. Built on top of the official [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk) 1.21.1, this package provides a decorator-based approach to building MCP servers with NestJS.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Example Repository](#example-repository)
- [MCP Playground](#mcp-playground)
- [Type-Safe Client Generator](#type-safe-client-generator)
- [Guards & Interceptors](#guards--interceptors)
- [Configuration](#configuration)
- [Decorators](#decorators)
- [Versioning & Deprecation](#versioning--deprecation)
- [Transport Options](#transport-options)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🎯 **Decorator-based API**: Use `@MCPTool`, `@MCPToolWithParams`, `@MCPResource`, `@MCPResourceTemplate`, and `@MCPPrompt` decorators
- 🔄 **Auto-discovery**: Automatically discovers and registers tools, resources, and prompts from your providers
- 🛡️ **Guards & Interceptors**: Production-ready execution pipeline with authentication, rate limiting, logging, and error handling
- 🔐 **Security Built-in**: AuthGuard, RateLimitGuard, and PermissionGuard for access control
- 🌐 **Public Routes by Default**: All MCP endpoints automatically bypass application authentication while respecting your auth configuration
- 📊 **Observability**: LoggingInterceptor, TimeoutInterceptor, and ErrorMappingInterceptor for monitoring
- 🧪 **Built-in Playground**: Interactive web UI at `/mcp/playground` for testing tools, resources, and prompts without curl
- 🚀 **Client Generator**: CLI tool to generate 100% type-safe TypeScript clients from your running server
- 🌐 **Multiple Transport Protocols**: HTTP, WebSocket, SSE, Redis Pub/Sub, gRPC, and stdio support
- ⚡ **Lazy Loading**: Transport dependencies loaded on-demand - install only what you need
- 📡 **Real-time Communication**: WebSocket and SSE for bidirectional and streaming data
- 🔀 **Distributed Systems**: Redis adapter for multi-process clusters and horizontal scaling
- ⚡ **High Performance**: gRPC support for microservices and high-throughput scenarios
- 📦 **Official SDK Integration**: Powered by `@modelcontextprotocol/sdk` 1.21.1 with modern `McpServer` API
- 🔧 **TypeScript First**: Full type safety and IntelliSense support with Zod schema validation
- 📌 **Versioning & Deprecation**: Track versions and manage API evolution with built-in deprecation support
- 🎨 **Flexible Configuration**: Sync and async module configuration options
- 📝 **Logging Support**: Configurable log levels (error, warn, info, debug, verbose)
- 🚀 **Production Ready**: Built with NestJS best practices and comprehensive test coverage

## Installation

```bash
npm install @hmake98/nestjs-mcp
# or
yarn add @hmake98/nestjs-mcp
# or
pnpm add @hmake98/nestjs-mcp
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

### Optional Transport Dependencies

**The library uses lazy loading for transport adapters** - dependencies are only loaded when you actually use a transport. This significantly reduces installation size and startup time.

Install additional packages only for the transports you need:

```bash
# WebSocket transport
npm install ws

# Redis transport
npm install ioredis

# gRPC transport
npm install @grpc/grpc-js @grpc/proto-loader
```

> **Note**:
>
> - HTTP and stdio transports are built-in and require no additional dependencies
> - SSE transport uses `rxjs`, which is already a peer dependency
> - Transport dependencies are declared as optional peer dependencies
> - If you try to use a transport without its dependencies, you'll get a helpful error message with installation instructions

## Quick Start

### 1. Import the Module

Import and configure the `MCPModule` in your application module:

```typescript
import { Module } from '@nestjs/common';
import { MCPModule } from '@hmake98/nestjs-mcp';

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
import { MCPTool, MCPToolWithParams } from '@hmake98/nestjs-mcp';

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
import { MCPResource, MCPResourceTemplate } from '@hmake98/nestjs-mcp';

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
import { MCPPrompt } from '@hmake98/nestjs-mcp';

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

## Example Repository

**Want to see a complete working example?**

Check out the [nestjs-mcp-example](https://github.com/hmake98/nestjs-mcp-example) repository, which demonstrates all the features of this library in a real NestJS application:

- ✅ Complete setup with all decorators (`@MCPTool`, `@MCPResource`, `@MCPPrompt`)
- ✅ Guards and interceptors configuration
- ✅ Multiple transport protocols (HTTP, WebSocket, SSE, Redis, gRPC)
- ✅ Real-world use cases and best practices
- ✅ Type-safe client generation examples

Visit the repo to clone and run it locally: [github.com/hmake98/nestjs-mcp-example](https://github.com/hmake98/nestjs-mcp-example)

## MCP Playground

**Interactive web UI for testing your MCP server without curl or external tools.**

The built-in playground provides a browser-based interface for discovering and testing tools, resources, and prompts. Access it at:

```
http://localhost:3000/mcp/playground
```

### Features

- 📋 **Auto-discovery**: Automatically loads all registered tools, resources, and prompts
- 📝 **Dynamic Forms**: Generates input forms from JSON Schema parameter definitions
- ▶️ **Execute & Test**: Call tools, read resources, and test prompts with real-time results
- 📊 **Request Logging**: View JSON-RPC request/response history with timestamps
- 🎨 **Modern UI**: Clean, responsive design with tabbed navigation
- ⚡ **Zero Config**: Works out-of-the-box once MCPModule is imported

### Usage

1. **Start your NestJS app** with `MCPModule.forRoot()`:

    ```typescript
    @Module({
        imports: [
            MCPModule.forRoot({
                serverInfo: { name: 'my-app', version: '1.0.0' },
            }),
        ],
        providers: [YourMCPProviders],
    })
    export class AppModule {}
    ```

2. **Navigate to** `http://localhost:3000/mcp/playground` in your browser

3. **Select a tool/resource/prompt** from the list in the left panel

4. **Fill out the form** with required parameters

5. **Click "Execute"** to test and view results

### Playground Tabs

- **Tools**: Test MCP tools with parameter inputs and view return values
- **Resources**: Read static or templated resources by URI
- **Prompts**: Execute prompts with arguments and view generated messages
- **Logs**: Review request/response JSON-RPC history

> 💡 **Tip**: The playground uses the same `/mcp` JSON-RPC endpoint as external clients, so behavior is identical to production usage.

## Type-Safe Client Generator

**Automatically generate a fully type-safe TypeScript client from your running MCP server.**

The CLI tool introspects your server and generates a complete client library with 100% type safety, zero boilerplate, and full IntelliSense support.

### Quick Start

```bash
# Start your MCP server
npm run start

# Generate the client
npx @hmake98/nestjs-mcp client:generate \
  --url http://localhost:3000/mcp \
  --out ./mcp \
  --name my-mcp-client
```

### Usage

```typescript
import { createClient } from './mcp';

const mcp = createClient('http://localhost:3000/mcp');

// Fully typed tool calls
await mcp.tools['user.get']({ id: '123' });

// Resource access
await mcp.resources.read('file:///config/app.json');

// Prompt execution
await mcp.prompts['review-code']({
    language: 'typescript',
    code: 'function add(a, b) { return a + b; }',
});
```

### Features

- ✅ **100% Type Safety** - Parameter types, return types, all automatically inferred
- ✅ **Zero Boilerplate** - No manual JSON-RPC calls or schema definitions
- ✅ **IntelliSense** - Full auto-completion for all tools, resources, and prompts
- ✅ **Version Aware** - Includes deprecation warnings in JSDoc comments
- ✅ **Single Source of Truth** - Regenerate when your server changes
- ✅ **Framework Agnostic** - Works in React, Vue, Node.js workers, microservices

### Generated Structure

```
mcp/
├── index.ts          # Main entry with createClient()
├── client.ts         # Base MCPClient class
├── package.json      # Client metadata
├── tools/
│   └── index.ts      # Type-safe tool wrappers
├── resources/
│   └── index.ts      # Resource access functions
├── prompts/
│   └── index.ts      # Prompt execution functions
└── types/
    └── index.ts      # Generated TypeScript interfaces
```

### Integration Examples

**Frontend (React)**

```typescript
const mcp = createClient(process.env.REACT_APP_MCP_URL);

export function UserProfile({ userId }: { userId: string }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        mcp.tools['user.get']({ id: userId }).then(setUser);
    }, [userId]);

    return <div>{user?.name}</div>;
}
```

**Worker / Background Job**

```typescript
const mcp = createClient('http://mcp-server:3000/mcp');

export async function processVideo(videoId: string) {
    await mcp.tools['video.transcode']({
        id: videoId,
        format: 'mp4',
        quality: 'high',
    });
}
```

**Microservice**

```typescript
const mcp = createClient('http://mcp-server.internal:3000/mcp');

app.get('/analyze', async (req, res) => {
    const analysis = await mcp.tools['analyze-sentiment']({
        text: req.body.text,
    });
    res.json(analysis);
});
```

### CLI Options

```bash
npx @hmake98/nestjs-mcp client:generate [options]

Options:
  --url <url>         MCP server URL (required)
  --out <directory>   Output directory (default: ./mcp)
  --name <name>       Client package name (default: mcp)
  -V, --version       Output version number
  -h, --help          Display help
```

### Regenerating After Changes

When you update your MCP server (add/remove/modify tools), regenerate the client:

```bash
npx @hmake98/nestjs-mcp client:generate --url http://localhost:3000/mcp --out ./mcp
```

The client will be updated with the latest server definitions.

## Guards & Interceptors

**Production-ready execution pipeline control for authentication, authorization, logging, and error handling.**

Guards and interceptors provide powerful control over your MCP tool/resource/prompt execution:

### Quick Example

```typescript
import { Injectable } from '@nestjs/common';
import {
    MCPTool,
    UseMCPGuards,
    UseMCPInterceptors,
    AuthGuard,
    RateLimitGuard,
    LoggingInterceptor,
    TimeoutInterceptor,
} from '@hmake98/nestjs-mcp';

@Injectable()
export class SecureToolProvider {
    @UseMCPGuards(AuthGuard, RateLimitGuard)
    @UseMCPInterceptors(LoggingInterceptor, new TimeoutInterceptor(5000))
    @MCPTool({
        name: 'production_ready_tool',
        description: 'Secured, rate-limited, logged, and timed',
    })
    async productionTool() {
        return 'Protected and monitored data';
    }
}
```

### Built-in Guards

- **`AuthGuard`**: Authentication (extend for JWT, OAuth, etc.)
- **`RateLimitGuard`**: Rate limiting (10 req/min default, configurable)
- **`PermissionGuard`**: Role-based access control

### Built-in Interceptors

- **`LoggingInterceptor`**: Execution logging with timing
- **`TimeoutInterceptor`**: Prevent long-running operations
- **`ErrorMappingInterceptor`**: Consistent error responses

### Usage Patterns

```typescript
// Authentication only
@UseMCPGuards(AuthGuard)
@MCPTool({ name: 'auth_tool', description: 'Requires auth' })
async authTool() { return 'data'; }

// Full production stack
@UseMCPGuards(AuthGuard, RateLimitGuard, PermissionGuard)
@UseMCPInterceptors(
    LoggingInterceptor,
    new TimeoutInterceptor(10000),
    ErrorMappingInterceptor,
)
@MCPTool({ name: 'enterprise_tool', description: 'Enterprise ready' })
async enterpriseTool() { return 'data'; }
```

### Custom Guards

```typescript
import { Injectable } from '@nestjs/common';
import {
    MCPGuard,
    MCPExecutionContext,
    MCPUnauthorizedException,
} from '@hmake98/nestjs-mcp';

@Injectable()
export class JWTAuthGuard implements MCPGuard {
    async canActivate(context: MCPExecutionContext): Promise<boolean> {
        const request = context.getRequest();
        const token = request.params?.auth?.token;

        if (!(await this.validateToken(token))) {
            throw new MCPUnauthorizedException('Invalid token');
        }
        return true;
    }

    private async validateToken(token: string): Promise<boolean> {
        // Your JWT validation logic
        return true;
    }
}
```

### Custom Interceptors

```typescript
import { Injectable } from '@nestjs/common';
import {
    MCPInterceptor,
    MCPExecutionContext,
    MCPCallHandler,
} from '@hmake98/nestjs-mcp';

@Injectable()
export class CachingInterceptor implements MCPInterceptor {
    private cache = new Map();

    async intercept(
        context: MCPExecutionContext,
        next: MCPCallHandler,
    ): Promise<unknown> {
        const key = context.switchToMcp().getOperationName();
        if (this.cache.has(key)) return this.cache.get(key);

        const result = await next.handle();
        this.cache.set(key, result);
        return result;
    }
}
```

📚 **[Complete Guards & Interceptors Documentation →](./docs/guards-interceptors.md)**

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

    // Root-level path configuration (bypasses application global prefix)
    rootPath?: boolean; // Default: false
    // When true: MCP endpoints are at /mcp (ignores app.setGlobalPrefix())
    // When false: MCP endpoints respect global prefix (e.g., /v1/mcp)
    // Note: Application-level guards, interceptors, and middleware still apply

    // Public route metadata key configuration
    publicMetadataKey?: string; // Default: 'mcp:isPublic'
    // All MCP endpoints (POST /mcp, POST /mcp/batch, GET /mcp/playground) are
    // automatically marked as public to bypass application authentication.
    // Use this option to customize the metadata key if your app uses a different convention.
    // Example: publicMetadataKey: 'isPublic' to match your existing auth guard

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
import { MCPModule } from '@hmake98/nestjs-mcp';

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
import { MCPModule } from '@hmake98/nestjs-mcp';

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
import { MCPOptionsFactory, MCPModuleOptions } from '@hmake98/nestjs-mcp';

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

### Root-Level Endpoints with Application Authentication

When integrating MCP into a server application with a global prefix (e.g., `/v1`), you may want MCP endpoints at the root level (`/mcp`) instead of under the prefix (`/v1/mcp`). The `rootPath` option combined with NestJS's `exclude` configuration makes this possible.

**🔑 Important Authentication Behavior:**

All MCP endpoints are **automatically marked as public** by default to ensure seamless integration:

- **All MCP endpoints are public by default**: `POST /mcp`, `POST /mcp/batch`, and `GET /mcp/playground` all bypass application authentication
- **Seamless integration**: MCP endpoints work out-of-the-box without requiring authentication configuration
- **Customizable**: Use the `publicMetadataKey` option to integrate with your app's existing public route system
- **Flexible security**: You can still add MCP-specific guards using `@UseMCPGuards()` decorator for per-tool/resource authentication

**Why are MCP endpoints public?**

MCP is designed as a protocol layer for AI model communication. Making endpoints public by default allows:
- ✅ Zero-configuration integration with Claude Desktop and other MCP clients
- ✅ Easy testing and development with the built-in playground
- ✅ Flexibility to add custom authentication per-tool/resource as needed
- ✅ Standard MCP protocol behavior across implementations

**Example: MCP endpoints at root with global auth guard**

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MCPModule, MCP_PUBLIC_KEY } from '@hmake98/nestjs-mcp';
import { Reflector } from '@nestjs/core';
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';

// Your authentication guard
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Check if route is marked as public (MCP endpoints are automatically marked)
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            MCP_PUBLIC_KEY, // Default: 'mcp:isPublic'
            [context.getHandler(), context.getClass()],
        );

        if (isPublic) {
            return true; // Skip auth for public routes (all MCP endpoints)
        }

        // Your auth logic for other API routes
        const request = context.switchToHttp().getRequest();
        const token = request.headers['authorization'];

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        // Validate token...
        return this.validateToken(token);
    }

    private validateToken(token: string): boolean {
        // Your token validation logic
        return token === 'valid-token';
    }
}

@Module({
    imports: [
        MCPModule.forRoot({
            serverInfo: {
                name: 'my-api-server',
                version: '1.0.0',
            },
            rootPath: true, // Use root-level paths for MCP
            logLevel: 'info',
            // Optional: Use your app's existing public metadata key
            // publicMetadataKey: 'isPublic',
        }),
    ],
    providers: [
        // Global guard applies to ALL routes except those marked as public
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class AppModule {}

// In your main.ts
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Set global prefix for API routes, but exclude MCP endpoints
    app.setGlobalPrefix('v1', {
        exclude: ['/mcp(.*)'], // Regex pattern to exclude all MCP routes
    });

    // Result:
    // - API endpoints: /v1/users, /v1/products, etc. (protected by AuthGuard)
    // - /mcp (POST) - Public (bypasses AuthGuard automatically)
    // - /mcp/batch (POST) - Public (bypasses AuthGuard automatically)
    // - /mcp/playground (GET) - Public (bypasses AuthGuard automatically)

    await app.listen(3000);
}
bootstrap();
```

**Without `rootPath` (default behavior)**

If you don't set `rootPath: true`, MCP endpoints will respect the global prefix:

```typescript
// main.ts
app.setGlobalPrefix('v1'); // No exclude needed

// Result:
// - API endpoints: /v1/users, /v1/products, etc.
// - /v1/mcp (POST) - Public (bypasses AuthGuard automatically)
// - /v1/mcp/batch (POST) - Public (bypasses AuthGuard automatically)
// - /v1/mcp/playground (GET) - Public (bypasses AuthGuard automatically)
```

**Example: Adding custom authentication to MCP endpoints**

If you need to protect MCP endpoints with custom authentication, you have two options:

**Option 1: Remove the public metadata (not recommended)**

You can override the public behavior, but this breaks standard MCP client compatibility:

```typescript
// This approach is NOT recommended as it breaks MCP protocol conventions
// MCP clients expect public endpoints for protocol-level communication
```

**Option 2: Use MCP Guards for per-tool authentication (recommended)**

Instead of protecting the protocol-level endpoints, add authentication at the tool/resource level:

```typescript
import { UseMCPGuards, MCPGuard } from '@hmake98/nestjs-mcp';

@Injectable()
export class ToolAuthGuard implements MCPGuard {
    async canActivate(context: MCPExecutionContext): Promise<boolean> {
        const request = context.getRequest();
        const apiKey = request.params?.auth?.apiKey;

        if (!apiKey || apiKey !== process.env.MCP_API_KEY) {
            throw new MCPUnauthorizedException('Invalid API key');
        }
        return true;
    }
}

@Injectable()
export class SecureToolsService {
    // This tool requires authentication
    @UseMCPGuards(ToolAuthGuard)
    @MCPTool({
        name: 'secure-operation',
        description: 'A secure operation requiring authentication',
    })
    async secureOperation(params: { data: string; auth: { apiKey: string } }) {
        return { result: 'Protected data' };
    }

    // This tool is public (no guard)
    @MCPTool({
        name: 'public-operation',
        description: 'A public operation',
    })
    async publicOperation(params: { data: string }) {
        return { result: 'Public data' };
    }
}
```

**Key Points:**

- **All MCP endpoints are public by default** - This is the standard MCP protocol behavior
- `rootPath: true` places MCP at `/mcp` (requires `exclude` in `setGlobalPrefix`)
- `rootPath: false` (default) places MCP at `/{globalPrefix}/mcp`
- Use `MCP_PUBLIC_KEY` constant in your auth guards to check for public routes
- For authentication, use MCP Guards (`@UseMCPGuards()`) at the tool/resource level instead of global auth
- `publicMetadataKey` option allows integration with your app's existing public route system
- Application-level interceptors and middleware still apply to all MCP endpoints

**Custom Public Metadata Key**

If your application already uses a different metadata key for public routes (e.g., `IS_PUBLIC_KEY`), you can configure MCP to use the same key:

```typescript
MCPModule.forRoot({
    serverInfo: { name: 'my-server', version: '1.0.0' },
    publicMetadataKey: 'IS_PUBLIC_KEY', // Use your app's existing key
});
```

This ensures the playground uses your application's standard public route convention.

### Feature Module Registration

Use `forFeature()` when you want to use MCP services without exposing HTTP endpoints:

```typescript
import { Module } from '@nestjs/common';
import { MCPModule } from '@hmake98/nestjs-mcp';

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
import { z } from 'zod';

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
import { z } from 'zod';

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
import { Injectable } from '@nestjs/common';
import { MCPTool, MCPResource, MCPPrompt } from '@hmake98/nestjs-mcp';
import { z } from 'zod';

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

    private processV1(input: string) {
        return `v1: ${input}`;
    }

    private processV3(input: string) {
        return `v3: ${input}`;
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

### Lazy Loading Architecture

**All transport adapters use lazy loading** - dependencies are dynamically imported only when a transport is first used. This provides several benefits:

- 🚀 **Faster Startup**: No overhead from unused transports
- 📦 **Smaller Bundle**: Install only what you need
- 🔧 **Flexible**: Add/remove transports without touching dependencies
- 💡 **Smart Errors**: Clear messages guide you to install missing packages

When you enable a transport, the adapter automatically checks for and loads its dependencies. If a dependency is missing, you'll see a helpful error message with exact installation instructions.

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

### WebSocket Transport

Real-time bidirectional communication using WebSockets. Perfect for:

- Browser extensions
- Real-time applications
- Interactive UI clients
- Long-lived connections

**Installation:**

```bash
npm install ws
```

> **Note**: The WebSocket adapter uses lazy loading - the `ws` package is only imported when you enable WebSocket transport. If the package is missing, you'll get a clear error message with installation instructions.

**Configuration:**

```typescript
import { MCPModule, MCPTransportType } from '@hmake98/nestjs-mcp';

@Module({
    imports: [
        MCPModule.forRoot({
            serverInfo: {
                name: 'my-server',
                version: '1.0.0',
            },
            transports: [
                {
                    type: MCPTransportType.WEBSOCKET,
                    enabled: true,
                    options: {
                        port: 3001,
                        host: '0.0.0.0',
                        path: '/mcp-ws',
                        maxConnections: 100,
                        perMessageDeflate: false,
                        maxPayload: 10 * 1024 * 1024, // 10MB
                    },
                },
            ],
        }),
    ],
})
export class AppModule {}
```

**Client Example (JavaScript):**

```javascript
const ws = new WebSocket('ws://localhost:3001/mcp-ws');

ws.onopen = () => {
    // Send MCP request
    ws.send(
        JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
        }),
    );
};

ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    console.log('Response:', response);
};
```

### Server-Sent Events (SSE) Transport

One-way streaming from server to client. Perfect for:

- Progressive updates
- Event notifications
- Browser-based applications
- Lightweight real-time updates

> **Note**: SSE transport uses `rxjs`, which is already included as a peer dependency. No additional installation required.

**Configuration:**

```typescript
import { MCPModule, MCPTransportType } from '@hmake98/nestjs-mcp';

@Module({
    imports: [
        MCPModule.forRoot({
            serverInfo: {
                name: 'my-server',
                version: '1.0.0',
            },
            transports: [
                {
                    type: MCPTransportType.SSE,
                    enabled: true,
                    options: {
                        path: '/mcp-sse',
                        heartbeatInterval: 30000, // 30s
                        retryInterval: 3000, // 3s
                    },
                },
            ],
        }),
    ],
})
export class AppModule {}
```

**Client Example (JavaScript):**

```javascript
const eventSource = new EventSource('http://localhost:3000/mcp-sse');

eventSource.addEventListener('mcp-response', (event) => {
    const response = JSON.parse(event.data);
    console.log('Response:', response);
});

eventSource.addEventListener('heartbeat', (event) => {
    console.log('Heartbeat:', event.data);
});

// Send request via POST to trigger response
fetch('http://localhost:3000/mcp-sse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
    }),
});
```

### Redis Transport

Pub/Sub communication via Redis. Perfect for:

- Multi-process clusters
- Horizontal scaling
- Microservices architecture
- Distributed systems

**Installation:**

```bash
npm install ioredis
```

> **Note**: The Redis adapter uses lazy loading - `ioredis` is only imported when you enable Redis transport. If the package is missing, you'll get a clear error message with installation instructions.

**Configuration:**

```typescript
import { MCPModule, MCPTransportType } from '@hmake98/nestjs-mcp';

@Module({
    imports: [
        MCPModule.forRoot({
            serverInfo: {
                name: 'my-server',
                version: '1.0.0',
            },
            transports: [
                {
                    type: MCPTransportType.REDIS,
                    enabled: true,
                    options: {
                        host: 'localhost',
                        port: 6379,
                        password: 'your-password', // Optional
                        db: 0,
                        channelPrefix: 'mcp',
                        requestChannel: 'requests',
                        responseChannel: 'responses',
                    },
                },
            ],
        }),
    ],
})
export class AppModule {}
```

**Usage:**

The Redis adapter uses pub/sub channels:

- **Requests**: Published to `mcp:requests`
- **Responses**: Published to `mcp:responses:{clientId}`
- **Broadcasts**: Published to `mcp:broadcast`

**Client Example (Node.js with ioredis):**

```typescript
import Redis from 'ioredis';

const publisher = new Redis();
const subscriber = new Redis();

const clientId = 'client-123';

// Subscribe to responses
await subscriber.subscribe(`mcp:responses:${clientId}`);

subscriber.on('message', (channel, message) => {
    const response = JSON.parse(message);
    console.log('Response:', response);
});

// Send request
await publisher.publish(
    'mcp:requests',
    JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        clientId: clientId,
    }),
);
```

### gRPC Transport

High-performance RPC with bidirectional streaming. Perfect for:

- Microservices
- High-throughput systems
- Type-safe communication
- Cross-language support

**Installation:**

```bash
npm install @grpc/grpc-js @grpc/proto-loader
```

> **Note**: The gRPC adapter uses lazy loading - `@grpc/grpc-js` and `@grpc/proto-loader` are only imported when you enable gRPC transport. If packages are missing, you'll get a clear error message with installation instructions.

**Configuration:**

```typescript
import { MCPModule, MCPTransportType } from '@hmake98/nestjs-mcp';

@Module({
    imports: [
        MCPModule.forRoot({
            serverInfo: {
                name: 'my-server',
                version: '1.0.0',
            },
            transports: [
                {
                    type: MCPTransportType.GRPC,
                    enabled: true,
                    options: {
                        port: 50051,
                        host: '0.0.0.0',
                        secure: false, // Set true for TLS
                        // For TLS:
                        // secure: true,
                        // credentials: {
                        //     rootCerts: fs.readFileSync('ca.pem'),
                        //     privateKey: fs.readFileSync('server-key.pem'),
                        //     certChain: fs.readFileSync('server-cert.pem'),
                        // },
                    },
                },
            ],
        }),
    ],
})
export class AppModule {}
```

**Proto File Location:**

The proto file is included at `node_modules/@hmake98/nestjs-mcp/dist/transports/proto/mcp.proto`

**Client Example (Node.js):**

```typescript
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const packageDefinition = protoLoader.loadSync('mcp.proto');
const proto = grpc.loadPackageDefinition(packageDefinition);

const client = new proto.mcp.MCPService(
    'localhost:50051',
    grpc.credentials.createInsecure(),
);

// Unary call
client.Call(
    {
        jsonrpc: '2.0',
        string_id: '1',
        method: 'tools/list',
        params_json: '{}',
    },
    (err, response) => {
        if (err) {
            console.error(err);
        } else {
            const result = JSON.parse(response.result_json);
            console.log('Tools:', result);
        }
    },
);

// Bidirectional streaming
const stream = client.Stream();

stream.on('data', (response) => {
    console.log('Response:', response);
});

stream.write({
    jsonrpc: '2.0',
    string_id: '1',
    method: 'tools/list',
    params_json: '{}',
});
```

### Multiple Transports

You can enable multiple transports simultaneously:

```typescript
import { MCPModule, MCPTransportType } from '@hmake98/nestjs-mcp';

@Module({
    imports: [
        MCPModule.forRoot({
            serverInfo: {
                name: 'multi-transport-server',
                version: '1.0.0',
            },
            transports: [
                {
                    type: MCPTransportType.WEBSOCKET,
                    enabled: true,
                    options: { port: 3001 },
                },
                {
                    type: MCPTransportType.SSE,
                    enabled: true,
                    options: { path: '/mcp-sse' },
                },
                {
                    type: MCPTransportType.REDIS,
                    enabled: true,
                    options: {
                        host: 'localhost',
                        port: 6379,
                    },
                },
                {
                    type: MCPTransportType.GRPC,
                    enabled: true,
                    options: { port: 50051 },
                },
            ],
        }),
    ],
})
export class AppModule {}
```

### Transport Comparison

| Transport     | Direction        | Use Case                        | Performance | Complexity |
| ------------- | ---------------- | ------------------------------- | ----------- | ---------- |
| **HTTP**      | Request/Response | REST APIs, Simple integration   | Good        | Low        |
| **WebSocket** | Bidirectional    | Real-time apps, Browser clients | Excellent   | Medium     |
| **SSE**       | Server → Client  | Live updates, Notifications     | Good        | Low        |
| **Redis**     | Pub/Sub          | Multi-process, Distributed      | Very Good   | Medium     |
| **gRPC**      | Bidirectional    | Microservices, High-throughput  | Excellent   | High       |
| **stdio**     | Bidirectional    | CLI tools, Desktop apps         | Good        | Low        |

### Stdio Transport

For CLI tools or desktop applications (like Claude Desktop), use stdio transport:

```typescript
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MCPSDKService } from '@hmake98/nestjs-mcp';

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
import { MCPService } from '@hmake98/nestjs-mcp';

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
import { MCPRegistryService } from '@hmake98/nestjs-mcp';

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
import { MCPSDKService } from '@hmake98/nestjs-mcp';

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
import { MCPDiscoveryService } from '@hmake98/nestjs-mcp';

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

This package integrates the official `@modelcontextprotocol/sdk` 1.21.1 with NestJS using a layered architecture:

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
│   (Official MCP SDK 1.21.1)             │
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

### Complete Application Example (Code Snippets)

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MCPModule } from '@hmake98/nestjs-mcp';
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
import { MCPToolWithParams } from '@hmake98/nestjs-mcp';

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
import { MCPResourceTemplate } from '@hmake98/nestjs-mcp';

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
import { MCPPrompt } from '@hmake98/nestjs-mcp';

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
