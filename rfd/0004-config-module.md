# Config Module — Centralized Environment & Static Settings

## Context

Move environment variables and static configuration out of `src/index.ts` into a dedicated module so configuration logic is centralized, validated, and easier to extend.

## Project Structure

```
searxng-mcp/
└── src/
    ├── config.ts        (new — env + static config)
    └── index.ts         (update — consume config module)
```

## Design Decisions

- **Single source of truth**: Environment variables and static values live in `src/config.ts`.
- **Fail fast**: Missing required env values should produce a clear error immediately.
- **Normalized URL**: Strip trailing slashes from `SEARXNG_URL` in config.
- **Typed exports**: Export a typed config object and named constants.
- **No runtime loaders**: Use a TypeScript module (no .env loader or JSON parser).

## Implementation Steps

### 1. Add `src/config.ts`

Create a module that:

- Reads `SEARXNG_URL` from `process.env`
- Validates presence, throwing a descriptive error if missing
- Normalizes the base URL by trimming trailing slashes
- Defines static server metadata: `SERVER_NAME` and `SERVER_VERSION`
- Exports a single config object (e.g., `appConfig`) containing:
  - `baseUrl`
  - `serverName`
  - `serverVersion`

### 2. Update `src/index.ts`

- Replace direct env reads with imports from `src/config.ts`
- Use `appConfig.baseUrl` when registering tools
- Use `appConfig.serverName` and `appConfig.serverVersion` for the `McpServer`
- Preserve existing logging behavior for errors

### 3. Documentation touch-up (optional)

- Note that configuration is centralized in `src/config.ts` while `SEARXNG_URL` remains required

## Verification

1. Run locally with env set:
   - `SEARXNG_URL=http://localhost:8080 bun run src/index.ts`
2. Run without env:
   - Expect a clear error and early exit
