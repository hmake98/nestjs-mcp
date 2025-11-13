# NestJS MCP Examples

This directory contains example implementations demonstrating how to use `nestjs-mcp` in various scenarios.

## Available Examples

### 📁 [Basic Example](./basic/)

A comprehensive example showing all core features:

- **Tools**: Mathematical operations, string manipulation, and calculations
- **Resources**: Static and dynamic resources with URI templates
- **Prompts**: Reusable prompt templates for AI interactions
- **HTTP/JSON-RPC**: Complete server setup with RESTful endpoints

**Perfect for**: Getting started, learning the basics, reference implementation

[View Basic Example →](./basic/)

---

## Running Examples

Each example is self-contained and can run independently:

```bash
# 1. Build the library (from repository root)
npm install
npm run build

# 2. Navigate to an example
cd examples/basic

# 3. Install example dependencies
npm install

# 4. Run the example
npm start
```

## Example Structure

Each example follows this structure:

```
example-name/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Main module with MCPModule configuration
│   ├── tools/               # Tool implementations
│   ├── resources/           # Resource implementations
│   └── prompts/             # Prompt implementations
├── package.json             # Example dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # Example-specific documentation
```

## Requirements

- Node.js >= 18
- npm >= 9
- Built `nestjs-mcp` library (run `npm run build` from root)

## Creating Your Own Example

Want to contribute an example? Great! Here's how:

1. Create a new directory under `examples/`
2. Set up a standalone NestJS project
3. Reference the library using `"nestjs-mcp": "file:../.."`
4. Add comprehensive README with:
    - What the example demonstrates
    - How to run it
    - Example requests/responses
5. Submit a PR!

## Need Help?

- 📚 [Main Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/hmake98/nestjs-mcp/issues)
- 💬 [Discussions](https://github.com/hmake98/nestjs-mcp/discussions)

## More Examples Coming Soon

We're working on additional examples including:

- **Advanced**: Complex tool patterns, error handling, middleware
- **Microservices**: MCP in distributed systems
- **Database Integration**: Working with databases and ORMs
- **Authentication**: Securing your MCP server
- **Real-time**: WebSocket integration

Stay tuned!
