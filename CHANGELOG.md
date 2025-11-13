## 1.0.0 (2025-11-13)

### Features

* add basic example implementation for nestjs-mcp with tools, resources, and prompts ([185d1bd](https://github.com/hmake98/nestjs-mcp/commit/185d1bd5c3920e3e5ad18df084d4d697d2f40b0c))
* add comprehensive tests for MCP services and exceptions with improved coverage ([a231b04](https://github.com/hmake98/nestjs-mcp/commit/a231b040139757903450cb0a70f2e6d3e8f8a070))
* add versioning and deprecation support for MCP tools, resources, and prompts ([1a30846](https://github.com/hmake98/nestjs-mcp/commit/1a30846a21ce9c2ab7c1c6a8dfc1ceaa5eb2be99))
* enhance MCPService tests with MCPExecutionService and ModuleRef mock ([d610133](https://github.com/hmake98/nestjs-mcp/commit/d61013343e605e01f0a70c9aba0e2f4d98fef400))
* implement logging functionality with configurable log levels in MCP module and services ([4d899b4](https://github.com/hmake98/nestjs-mcp/commit/4d899b48f02317098f45b4e3b58ba49938b1182a))
* initial implementation of MCP (Model Context Protocol) module for NestJS ([c8c4e7b](https://github.com/hmake98/nestjs-mcp/commit/c8c4e7b8854f5de5d66cf1a040f2173df9fed758))
* integrate Zod for schema validation in MCP service and tools; add utility functions for JSON Schema conversion ([899e0a9](https://github.com/hmake98/nestjs-mcp/commit/899e0a9375e6fd141fe4cce4e57369531cc3fb37))
* **tests:** add comprehensive unit tests for MCPService ([ab06e47](https://github.com/hmake98/nestjs-mcp/commit/ab06e47b9579ddcb29f0a19b077df77b6cd1d039))

### Bug Fixes

* enable credential persistence in GitHub Actions checkout step ([29ed518](https://github.com/hmake98/nestjs-mcp/commit/29ed518ba0c1d23d8ad2c197b0670763c149b701))

### Documentation

* update copilot instructions for clarity and completeness ([fa7e26f](https://github.com/hmake98/nestjs-mcp/commit/fa7e26fec0d03bbf7b98710e4d50bcccda77cda0))

### Code Refactoring

* remove examples section and related links from README ([cb0770a](https://github.com/hmake98/nestjs-mcp/commit/cb0770a9207259dd04f2fa9c7dfb55c304cae95a))
* replace 'any' with 'unknown' in decorators and tests for improved type safety ([c297cc6](https://github.com/hmake98/nestjs-mcp/commit/c297cc6824b90ab504e9b2a9651553da69ec1a26))

### Tests

* enhance MCPModule and Zod helpers tests for logging and schema handling ([0597d3d](https://github.com/hmake98/nestjs-mcp/commit/0597d3d6eb19e10f3d099385839e4c11e856e47a))
* enhance unit tests for RateLimitGuard, MCPDiscoveryService, MCPService, and Zod helpers with edge case handling ([8e9ca68](https://github.com/hmake98/nestjs-mcp/commit/8e9ca6838e62b2929f2544751a6122b333d14f13))
