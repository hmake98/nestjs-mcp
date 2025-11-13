# Basic NestJS MCP Example

This is a basic example demonstrating how to use `nestjs-mcp` to create an MCP (Model Context Protocol) server.

## Features Demonstrated

- ✅ **Tools**: Mathematical operations, string manipulation, and calculators
- ✅ **Resources**: Static and dynamic resources with URI templates
- ✅ **Prompts**: Reusable prompt templates for AI interactions
- ✅ **HTTP/JSON-RPC**: RESTful endpoints for MCP protocol

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Main application module
├── tools/
│   └── calculator.service.ts    # Tool implementations
├── resources/
│   └── file.service.ts          # Resource implementations
└── prompts/
    └── prompt.service.ts        # Prompt implementations
```

## Getting Started

### 1. Install Dependencies

First, build the main nestjs-mcp library:

```bash
# From the root of the repository
cd ../..
npm install
npm run build
```

Then install example dependencies:

```bash
# From this directory
cd examples/basic
npm install
```

### 2. Run the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

For development with auto-reload:

```bash
npm run start:dev
```

## Testing the Server

### 1. List Available Tools

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

### 2. Call a Tool

```bash
# Add two numbers
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

# Calculate with operation
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "calculate",
      "arguments": {
        "operation": "multiply",
        "a": 6,
        "b": 7
      }
    }
  }'

# Reverse a string
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "reverse-string",
      "arguments": {
        "text": "Hello World"
      }
    }
  }'
```

### 3. List Resources

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "resources/list"
  }'
```

### 4. Read a Resource

```bash
# Read static resource
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 6,
    "method": "resources/read",
    "params": {
      "uri": "file:///readme.txt"
    }
  }'

# Read dynamic resource
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 7,
    "method": "resources/read",
    "params": {
      "uri": "file:///example.txt"
    }
  }'

# Read user profile
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 8,
    "method": "resources/read",
    "params": {
      "uri": "user:///1/profile"
    }
  }'
```

### 5. List Prompts

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 9,
    "method": "prompts/list"
  }'
```

### 6. Get a Prompt

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 10,
    "method": "prompts/get",
    "params": {
      "name": "code-review",
      "arguments": {
        "language": "typescript",
        "code": "function add(a, b) { return a + b; }",
        "focus": "type safety"
      }
    }
  }'
```

### 7. Batch Requests

```bash
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
    },
    {
      "jsonrpc": "2.0",
      "id": 3,
      "method": "prompts/list"
    }
  ]'
```

## Understanding the Code

### Tools (`src/tools/calculator.service.ts`)

Tools are functions that can be called by MCP clients. Use `@MCPTool` or `@MCPToolWithParams`:

```typescript
@MCPToolWithParams({
  name: 'add',
  description: 'Add two numbers',
  parameters: [
    { name: 'a', type: 'number', description: 'First number', required: true },
    { name: 'b', type: 'number', description: 'Second number', required: true },
  ],
})
async add(params: { a: number; b: number }): Promise<number> {
  return params.a + params.b;
}
```

### Resources (`src/resources/file.service.ts`)

Resources provide access to data. Use `@MCPResource` for static resources or `@MCPResourceTemplate` for dynamic ones:

```typescript
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
    text: 'Content here...',
  };
}

// Dynamic resource with template
@MCPResourceTemplate({
  uriTemplate: 'file:///{filename}',
  name: 'File',
  description: 'Get any file by filename',
  mimeType: 'text/plain',
})
async getFile(variables: { filename: string }) {
  return {
    uri: `file:///${variables.filename}`,
    mimeType: 'text/plain',
    text: `Content of ${variables.filename}`,
  };
}
```

### Prompts (`src/prompts/prompt.service.ts`)

Prompts provide reusable message templates for AI interactions:

```typescript
@MCPPrompt({
  name: 'code-review',
  description: 'Generate a code review prompt',
  arguments: [
    { name: 'language', description: 'Programming language', required: true },
    { name: 'code', description: 'Code to review', required: true },
  ],
})
async codeReview(args: { language: string; code: string }) {
  return [{
    role: 'user' as const,
    content: {
      type: 'text' as const,
      text: `Please review this ${args.language} code:\n\n${args.code}`,
    },
  }];
}
```

## Next Steps

- Explore the [main documentation](../../README.md)
- Add your own tools, resources, and prompts
- Integrate with your existing NestJS application
- Connect with MCP clients like Claude Desktop

## Troubleshooting

### Module not found: nestjs-mcp

Make sure you've built the library first:

```bash
cd ../..
npm run build
cd examples/basic
npm install
```

### Port already in use

Change the port in `src/main.ts` or set the `PORT` environment variable:

```bash
PORT=3001 npm start
```

## Learn More

- [NestJS Documentation](https://docs.nestjs.com)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [nestjs-mcp GitHub](https://github.com/hmake98/nestjs-mcp)
