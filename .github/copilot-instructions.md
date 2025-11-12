### Quick orientation — what this package is

This repository is a NestJS library that integrates the Model Context Protocol (MCP) with NestJS apps. It wraps the official `@modelcontextprotocol/sdk` and exposes a JSON-RPC HTTP controller under `/mcp` (and `/mcp/batch`).

Key files to read first:
- `src/modules/mcp.module.ts` — module registration patterns (forRoot, forRootAsync, forFeature).
- `src/services/*.ts` — core runtime: `MCPService`, `MCPRegistryService`, `MCPDiscoveryService`, `MCPSDKService`.
- `src/controllers/mcp.controller.ts` — HTTP JSON-RPC entrypoints.
- `src/decorators/*` — how to declare tools/resources/prompts (`@MCPTool`, `@MCPResource`, `@MCPPrompt`).
- `src/interfaces/mcp-protocol.interface.ts` — protocol shapes used across the codebase.

What matters for an AI coding agent
- The project is a library (not an app). Most changes will modify services, decorators, discovery, or registry behavior, or add new decorator-driven providers.
- Discovery happens at module init: `MCPModule.onModuleInit()` calls `discoveryService.discover*()` and then `registryService.register*()`.
- Registry storage is simple in-memory Maps (`MCPRegistryService`). Resources support `uri` or `uriTemplate` and a simple template matcher (`matchUriTemplate`) — be careful modifying this logic; it’s relied on by `MCPService.handleResourcesRead`.
- Tools call flow: JSON-RPC request -> `MCPController` -> `MCPService.handleRequest()` -> `registryService.getTool(name)` -> call tool.handler(args). Example request params: `{ name: 'add', arguments: { a:1, b:2 } }`.

Project-specific conventions and patterns
- Decorator-based discovery: any `@Injectable()` method decorated with the MCP decorators is discovered. To add a tool/resource/prompt, place an `@MCPTool`/`@MCPResource`/`@MCPPrompt` on an injectable method and register the class as a provider in a module imported by the host app.
- Use `MCPModule.forRoot()` (sync) or `forRootAsync()` when wiring up in an application. Use `forFeature()` when you want services without the HTTP controller.
- Logging controlled via the module option `enableLogging` (passed as `MCP_MODULE_OPTIONS`), which is injected everywhere that needs it.
- Keep JSON-RPC shapes stable — interfaces are defined in `src/interfaces/mcp-protocol.interface.ts`. Use those types when editing handlers.

Build / test / lint / run notes
- Build: `npm run build` (compiles to `./dist` via `tsc`).
- Tests: `npm test` (Jest + ts-jest configured). Add `*.spec.ts` files under `src` to test internals.
- Linting: `npm run lint` and formatting via `npm run format` (prettier + eslint). Husky is configured with lint-staged.

Integration points / external deps
- Depends on `@modelcontextprotocol/sdk` (runtime integration). Peer-dep: NestJS packages. Avoid changing public SDK usage without verifying compatibility.
- This library exposes the HTTP JSON-RPC endpoints used by clients. Consumer apps import `MCPModule` and provide decorated providers.

Examples and code snippets to follow patterns
- Tool handler signature (from `src/interfaces/mcp-protocol.interface.ts`):
  - `handler: (params: JSONObject) => Promise<JSONValue> | JSONValue`
- Resource discovery uses either `uri` or `uriTemplate`. When adding templated resources, keep the same template syntax `{var}` so `extractUriVariables` works.
- Example JSON-RPC call to list tools (useful for testing):
  - POST `/mcp` body: `{ "jsonrpc":"2.0", "id":1, "method":"tools/list" }`

Editing guidance for AI agents (concrete rules)
1. When adding new MCP methods, update both the method dispatcher in `MCPService.handleRequest()` and the TypeScript types in `src/interfaces/*`.
2. Registry keys: tools are keyed by `name`. Changing key semantics requires updating `MCPRegistryService` and all callers.
3. Resource template matching is simple regex-based; avoid subtle changes that would break `extractUriVariables` unless tests are added.
4. Preserve JSON-RPC response shapes (fields: `jsonrpc`, `id`, `result` or `error`) — tests rely on these shapes.
5. If touching discovery, verify `MCPModule.onModuleInit()` behavior — the module logs discovered counts and registers via the registry service.

If you edit behavior, add a minimal unit test in `src/*.spec.ts` validating the public behavior (e.g., `tools/list`, `resources/read` for a templated resource, or `prompts/get`).

Where to run quick checks
- `npm run build` — compiles types and surfaces TypeScript errors.
- `npm test` — runs unit tests.
- For manual runtime verification, create a small host NestJS app (see usage in the project README) that imports `MCPModule` and use `curl` against `/mcp`.

If anything here is incomplete or you want more examples (discovery internals, concrete decorator metadata keys, or tests to scaffold), tell me which section to expand and I’ll iterate.
