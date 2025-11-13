### Quick orientation — what this package is

This repository is a NestJS library that integrates the Model Context Protocol (MCP) with NestJS apps. It wraps the official `@modelcontextprotocol/sdk` (v1.21.1) and exposes a JSON-RPC HTTP controller under `/mcp` (and `/mcp/batch`).

Key files to read first:

- `src/modules/mcp.module.ts` — module registration patterns (forRoot, forRootAsync, forFeature).
- `src/services/*.ts` — core runtime: `MCPService`, `MCPRegistryService`, `MCPDiscoveryService`, `MCPSDKService`.
- `src/controllers/mcp.controller.ts` — HTTP JSON-RPC entrypoints (POST `/mcp` and POST `/mcp/batch`).
- `src/decorators/*` — how to declare tools/resources/prompts (`@MCPTool`, `@MCPToolWithParams`, `@MCPResource`, `@MCPResourceTemplate`, `@MCPPrompt`).
- `src/interfaces/mcp-protocol.interface.ts` — protocol shapes used across the codebase.
- `src/constants/mcp.constants.ts` — metadata keys, error codes, protocol version, and method enums.

What matters for an AI coding agent

- The project is a library (not an app). Most changes will modify services, decorators, discovery, or registry behavior, or add new decorator-driven providers.
- Discovery happens at module init: `MCPModule.onModuleInit()` calls `discoveryService.discover*()` and then `registryService.register*()`. Discovery uses NestJS's `DiscoveryService` + `MetadataScanner` + `Reflector` to find decorated methods on any `@Injectable()` provider.
- Registry storage is simple in-memory Maps (`MCPRegistryService`). Resources support `uri` (static) or `uriTemplate` (dynamic) and a simple template matcher (`matchUriTemplate`) — be careful modifying this logic; it's relied on by `MCPService.handleResourcesRead`. Resources are keyed by their URI or template string.
- Tools call flow: JSON-RPC request → `MCPController.handleRequest()` → `MCPService.handleRequest()` → method dispatcher → `registryService.getTool(name)` → call `tool.handler(args)`. Example request params: `{ name: 'add', arguments: { a:1, b:2 } }`.
- Tool results are normalized: handlers can return raw values (converted to `{ content: [{ type: 'text', text: '...' }] }`) or full `MCPToolResult` objects with `content[]` and optional `isError` flag.

Project-specific conventions and patterns

- Decorator-based discovery: any `@Injectable()` method decorated with the MCP decorators is discovered. To add a tool/resource/prompt, place an `@MCPTool`/`@MCPResource`/`@MCPPrompt` on an injectable method and register the class as a provider in a module imported by the host app.
- Decorator metadata keys are in `src/constants/mcp.constants.ts`: `MCP_TOOL_METADATA`, `MCP_RESOURCE_METADATA`, `MCP_PROMPT_METADATA`, `MCP_TOOL_PARAM_METADATA`. Discovery queries these via `Reflector.get()`.
- Use `MCPModule.forRoot()` (sync) or `forRootAsync()` (with `useFactory`/`useClass`/`useExisting`) when wiring up in an application. Use `forFeature()` when you want services without the HTTP controller.
- Logging controlled via the module option `enableLogging` (passed as `MCP_MODULE_OPTIONS`), which is injected everywhere that needs it.
- Keep JSON-RPC shapes stable — interfaces are defined in `src/interfaces/mcp-protocol.interface.ts`. Use those types when editing handlers. All responses must have `jsonrpc: '2.0'`, `id`, and either `result` or `error`.

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
  - Return values are auto-normalized: raw types → `{ content: [{ type: 'text', text: '...' }] }`, or return full `MCPToolResult` with `content[]` array and optional `isError: true`.
- Resource handler signature:
  - Static resource: `() => Promise<MCPResourceContent> | MCPResourceContent` (returns `{ uri, mimeType?, text?, blob? }`).
  - Template resource: `(variables: Record<string, string>) => Promise<MCPResourceContent> | MCPResourceContent`. Variables extracted via `extractUriVariables(template, uri)`.
- Prompt handler signature:
  - `(args: JSONObject) => Promise<PromptMessage[]> | PromptMessage[]` (returns array of `{ role, content: { type, text } }`).
- Resource discovery uses either `uri` or `uriTemplate`. When adding templated resources, keep the same template syntax `{var}` so `extractUriVariables` works.
- Example JSON-RPC call to list tools (useful for testing):
  - POST `/mcp` body: `{ "jsonrpc":"2.0", "id":1, "method":"tools/list" }`
  - Batch endpoint POST `/mcp/batch` accepts array of requests, returns array of responses.

Editing guidance for AI agents (concrete rules)

1. When adding new MCP methods, update both the method dispatcher in `MCPService.handleRequest()` and the TypeScript types in `src/interfaces/*`.
2. Registry keys: tools are keyed by `name`, prompts by `name`. Resources use either `uri` or `uriTemplate` as key. Changing key semantics requires updating `MCPRegistryService` and all callers.
3. Resource template matching is simple regex-based; avoid subtle changes that would break `extractUriVariables` unless tests are added. Template format: `{varName}` — regex converts to `([^/]+)` capture groups.
4. Preserve JSON-RPC response shapes (fields: `jsonrpc`, `id`, `result` or `error`) — tests rely on these shapes. All handlers return `MCPResponse` with these exact fields.
5. If touching discovery, verify `MCPModule.onModuleInit()` behavior — the module logs discovered counts and registers via the registry service. Discovery scans all `@Injectable()` providers using NestJS's `DiscoveryService` + `MetadataScanner` + `Reflector`.
6. When adding decorators, define metadata key in `src/constants/mcp.constants.ts` and use `SetMetadata()` in decorator. Discovery queries metadata via `Reflector.get(METADATA_KEY, method)`.
7. Error handling: tool/resource/prompt handler errors are caught and returned as JSON-RPC error responses with `MCPErrorCode.INTERNAL_ERROR`. Custom error handling supported via `options.errorHandler`.

If you edit behavior, add a minimal unit test in `src/*.spec.ts` validating the public behavior (e.g., `tools/list`, `resources/read` for a templated resource, or `prompts/get`). Note: currently no test files exist — tests should use Jest with ts-jest (see package.json config).

Where to run quick checks

- `npm run build` — compiles types and surfaces TypeScript errors.
- `npm test` — runs unit tests (Jest with ts-jest). Currently no test files exist, but config is ready in package.json.
- `npm run lint` / `npm run lint:check` — ESLint with Prettier integration (flat config in eslint.config.mjs).
- `npm run format` / `npm run format:check` — Prettier formatting.
- For manual runtime verification, create a small host NestJS app (see usage in the project README) that imports `MCPModule` and use `curl` against `/mcp`.

If anything here is incomplete or you want more examples (discovery internals, concrete decorator metadata keys, or tests to scaffold), tell me which section to expand and I'll iterate.
