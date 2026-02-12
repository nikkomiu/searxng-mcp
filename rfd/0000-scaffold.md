# SearXNG MCP Server — Scaffold Plan

## Context

Scaffold a new MCP server that provides web search capabilities via a SearXNG instance. The project is greenfield (only a README exists). The server will be written in TypeScript, run with Bun, use stdio transport, and expose two tools: `search` and `config`. The SearXNG instance URL is configured via the `SEARXNG_URL` environment variable.

## Project Structure

```
searxng-mcp/
├── README.md            (exists)
├── package.json         (new)
├── tsconfig.json        (new — IDE support only, no build step)
├── .gitignore           (new)
└── src/
    ├── index.ts         (entry point: env validation, server setup, transport)
    ├── searxng.ts       (HTTP client: search() and getConfig())
    ├── types.ts         (TypeScript interfaces for SearXNG API responses)
    └── tools/
        ├── search.ts    (register search tool with Zod schema + result formatting)
        └── config.ts    (register config tool + response formatting)
```

## Dependencies

- `@modelcontextprotocol/sdk` — MCP server SDK (`McpServer`, `StdioServerTransport`)
- `zod` — schema validation (peer dep of SDK, used for tool input schemas)

Install: `bun add @modelcontextprotocol/sdk zod`

## Implementation Steps

### 1. Initialize project

Create `package.json` with `"type": "module"`, a `"start"` script (`bun run src/index.ts`), and the two dependencies above. Create `tsconfig.json` with `noEmit: true`, `moduleResolution: "bundler"`, targeting ESNext. Create `.gitignore` for `node_modules/`.

### 2. Create `src/types.ts` — SearXNG response interfaces

Define TypeScript interfaces for the API responses (no Zod, just type annotations):

- `SearxngSearchResult` — `url`, `title`, `content`, `engine`, `engines`, `score`, `category`, `publishedDate?`
- `SearxngSearchResponse` — `query`, `number_of_results`, `results[]`, `answers[]`, `corrections[]`, `infoboxes[]`, `suggestions[]`, `unresponsive_engines[]`
- `SearxngInfobox` — `infobox`, `id`, `content`, `urls[]`
- `SearxngConfigResponse` — `categories[]`, `engines[]`, `locales`, `instance_name`, `safe_search`, `default_locale`, `version`
- `SearxngEngine` — `name`, `categories[]`, `shortcut`, `enabled`, `paging`, `language_support`, `safesearch`, `time_range_support`

### 3. Create `src/searxng.ts` — HTTP client

Two functions using native `fetch`:

- **`search(baseUrl, params)`** — `GET /search?q=...&format=json&...`. Builds URL with `URLSearchParams`. Returns `SearxngSearchResponse`.
- **`getConfig(baseUrl)`** — `GET /config`. Returns `SearxngConfigResponse`.

Both throw on non-OK responses with status code in the error message. `baseUrl` is passed as a parameter (not read from env) for testability.

### 4. Create `src/tools/search.ts` — search tool

Export `registerSearchTool(server, baseUrl)`:

- **Tool name:** `search`
- **Input schema (Zod):**
  - `query` — `z.string()` (required)
  - `categories` — `z.string().optional()` (comma-separated)
  - `engines` — `z.string().optional()` (comma-separated)
  - `language` — `z.string().optional()`
  - `time_range` — `z.enum(["day", "month", "year"]).optional()`
  - `pageno` — `z.number().int().min(1).default(1)`
  - `safesearch` — `z.enum(["0", "1", "2"]).optional()`
- **Handler:** calls `search()`, formats results as numbered text list with title, URL, snippet, published date, engines. Includes answers, infoboxes, suggestions, corrections when present. Returns `isError: true` on failure.

### 5. Create `src/tools/config.ts` — config tool

Export `registerConfigTool(server, baseUrl)`:

- **Tool name:** `config`
- **No input schema** (no parameters)
- **Handler:** calls `getConfig()`, formats output as text showing instance name, version, categories, enabled engines grouped by category, available locales, default safe search level. Returns `isError: true` on failure.

### 6. Create `src/index.ts` — entry point

- Read `SEARXNG_URL` from `process.env`, exit with error if missing
- Strip trailing slash from URL
- Create `McpServer({ name: "searxng", version: "1.0.0" })`
- Call `registerSearchTool()` and `registerConfigTool()`
- Create `StdioServerTransport`, connect, log to stderr

## Key Design Decisions

- **No build step** — Bun runs TypeScript directly; `tsconfig.json` is IDE-only with `noEmit: true`
- **All logging to stderr** — stdout is reserved for MCP JSON-RPC protocol
- **Fail fast** — missing `SEARXNG_URL` causes immediate exit
- **Text output formatting** — results are formatted as readable text, not raw JSON, for better LLM consumption
- **`.js` extensions on imports** — required for ESM compatibility with Bun's module resolution

## Verification

1. Install deps: `bun install`
2. Run the server: `SEARXNG_URL=http://localhost:8080 bun run src/index.ts` — should start without errors and wait for stdio input
3. Configure in Claude Code MCP settings and test both tools against a running SearXNG instance
