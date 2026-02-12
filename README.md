# SearXNG MCP Server

An MCP server that provides search results using SearXNG as the backend.

## Requirements

- Bun installed
- A SearXNG instance with JSON enabled (`json` in `search.formats`)
- `SEARXNG_URL` pointing at your instance (example: `http://localhost:8080`)

## Install

```bash
bun install
```

## Run locally

```bash
SEARXNG_URL=http://localhost:8080 bun run start
```

## Build a standalone binary (optional)

```bash
bun run build
```

## MCP client setup

Use the same MCP server definition everywhere; only the config location changes.

### Standard MCP server definition

```json
{
  "mcpServers": {
    "searxng": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/searxng-mcp/src/index.ts"],
      "env": {
        "SEARXNG_URL": "http://localhost:8080"
      }
    }
  }
}
```

### Standalone binary definition (if built)

```json
{
  "mcpServers": {
    "searxng": {
      "command": "searxng-mcp",
      "env": {
        "SEARXNG_URL": "http://localhost:8080"
      }
    }
  }
}
```

### OpenCode

Add a new MCP server entry in your OpenCode settings and paste the standard definition above.
Common config locations include `~/.config/opencode/mcp.json` (macOS/Linux) or `%APPDATA%\\opencode\\mcp.json` (Windows).

Terminal command:

```bash
opencode mcp add
```

When prompted, enter:

- Name: `searxng`
- Command: `searxng-mcp`
- Env: `SEARXNG_URL=http://localhost:8080`

### Claude Code

Create or update `~/.claude/mcp.json` and add the standard definition. Restart Claude Code after saving.

Terminal command:

```bash
claude mcp add -e SEARXNG_URL=http://localhost:8080 searxng -- bun run /absolute/path/to/searxng-mcp/src/index.ts
```

### LM Studio

Open Settings, find MCP Servers, and add a new server. Fill in `command`, `args`, and `env` from the standard definition.

### Other popular MCP clients

For Cursor, Continue, Cline (VS Code), Zed, and Windsurf, add a new MCP server in their MCP settings and paste the standard definition.
If the client expects a single server entry rather than a `mcpServers` object, use the inner `searxng` object only.
