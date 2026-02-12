# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that provides web search capabilities via SearXNG. It's written in TypeScript and runs with Bun runtime, exposing search and config tools over stdio transport.

## Development Commands

```bash
# Install dependencies
bun install

# Run the server (requires SEARXNG_URL env var)
SEARXNG_URL=http://localhost:8080 bun run src/index.ts

# Type check (does not emit files - Bun runs TypeScript directly)
bun run type-check

# Lint code
bun run lint

# Build standalone binary
bun run build
```

## Architecture

### MCP Server Pattern

The server follows the standard MCP architecture:

- **Entry point** (`src/index.ts`): Validates `SEARXNG_URL` env var, creates `McpServer`, registers tools, connects stdio transport
- **Tool registration** (`src/tools/*.ts`): Each tool exports a registration function that takes the server instance and base URL
- **HTTP client** (`src/searxng.ts`): Pure functions that call SearXNG API endpoints, accept base URL as parameter for testability
- **Type definitions** (`src/types.ts`): TypeScript interfaces for SearXNG API responses (not Zod schemas)

### Tool Implementation Pattern

Tools use the MCP SDK's `server.tool()` method with:
1. Tool name (string)
2. Zod schema object (not wrapped in `z.object()`)
3. Async handler function that returns `{ content: [{ type: "text", text }] }`

Error handling returns `{ isError: true, content: [...] }` instead of throwing.

### Import Conventions

- All imports use `.js` extensions even for `.ts` files (ESM requirement)
- Local imports use relative paths with extensions: `./searxng.js`, `../types.js`
- SDK imports use full subpaths: `@modelcontextprotocol/sdk/server/mcp.js`

### Response Formatting

Search results are formatted as human-readable text (not JSON) for LLM consumption:
- Answers, infoboxes, corrections, and suggestions appear before results
- Each result is numbered with title, URL, snippet, publish date, and source engines
- Unresponsive engines listed at the end

### Logging

All logging MUST use `console.error()` - stdout is reserved for MCP JSON-RPC protocol messages.

## Key Constraints

- **No build step for development**: Bun runs TypeScript directly. The `build` script creates a standalone binary for distribution.
- **`tsconfig.json` has `noEmit: true`**: TypeScript is only for IDE support, not compilation.
- **Required environment variable**: `SEARXNG_URL` must point to a SearXNG instance with JSON format enabled.
- **SearXNG JSON format**: The target instance must have `json` in `search.formats` in settings.yml, otherwise all requests return 403.

## Testing the Server

To test locally, you need a running SearXNG instance. Configure it in your MCP client (Claude Desktop, Claude Code, etc.):

```json
{
  "mcpServers": {
    "searxng": {
      "command": "bun",
      "args": ["run", "/path/to/searxng-mcp/src/index.ts"],
      "env": {
        "SEARXNG_URL": "http://localhost:8080"
      }
    }
  }
}
```

## RFD Process

This project uses RFDs (Request for Discussion) in the `rfd/` directory to document design decisions before implementation. Each RFD is numbered sequentially (0000, 0001, etc.) and describes the context, approach, and implementation plan for a feature or change.
