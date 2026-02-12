# Type & Lint Validation Plan

## Context

Add TypeScript type validation and modern linting to ensure code quality and catch errors early in development.

## Project Structure

```
searxng-mcp/
├── package.json               (update — add type-check and lint scripts)
└── .github/workflows/build.yml (update — add type-lint step)
```

## Design Decisions

- **Type validation**: Use `tsc --noEmit` — leverages existing TypeScript config with no additional dependencies
- **Linting**: Use Biome (modern replacement for ESLint) — faster, unified tool with formatting and linting in one
- **No pre-commit hooks** — keep CI-focused; let developers run locally as needed
- **CI integration**: Add type-lint step to GitHub Actions workflow for all pushes and PRs
- **No configuration files** — use Biome's sensible defaults; no biome.json needed for basic setup

## Implementation Steps

### 1. Add scripts to package.json

Add two new scripts:

- `type-check`: `tsc --noEmit`
- `lint`: `biome check src/`

### 2. Install Biome dependencies

Run:
```bash
bun add --dev biome
```

### 3. Update GitHub Actions workflow

In `.github/workflows/build.yml`, add a new step after `bun install`:

```yaml
- name: Type-check and lint
  run: |
    bun run type-check
    bun run lint
```

### 4. Update .gitignore (if needed)

Ensure `dist/` is still ignored — no new ignore entries required.

## Verification

1. Local validation:
   - `bun run type-check` — should pass with current code
   - `bun run lint` — should pass or show fixable issues (Biome will auto-format)
2. CI:
   - PRs and pushes will fail if type errors or lint issues exist
3. No configuration files needed — Biome and TypeScript use sensible defaults
