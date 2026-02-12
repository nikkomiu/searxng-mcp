# GitHub Actions — Build & Release Plan

## Context

Set up GitHub Actions to build the Bun app as a single binary, add the needed `package.json` build commands, store build artifacts in a predictable location, and publish those artifacts to the tagged GitHub release when the workflow runs on a tag.

## Project Structure

```
searxng-mcp/
├── .github/
│   └── workflows/
│       └── build.yml          (new — CI build & release workflow)
├── package.json               (update — add build scripts)
└── dist/                      (output — build artifacts)
```

## Design Decisions

- **Single-binary build** — use `bun build --compile` so CI produces standalone binaries.
- **Artifact location** — output to `dist/` to simplify artifact collection and release uploads.
- **Tag-based releases** — only publish artifacts on `v*` tagged builds.
- **Matrix builds** — build on `ubuntu-latest` and `macos-latest`.
- **Minimal scripting** — keep `package.json` scripts thin and CI handles naming.
- **Release publishing** — prefer GitHub CLI (`gh release upload`).

## Implementation Steps

### 1. Add build scripts to `package.json`

Add a `build` script:

- `bun build src/index.ts --compile --outfile dist/searxng-mcp`

(Optionally add a `build:release` script if OS/arch naming should be local rather than handled in CI.)

### 2. Create GitHub Actions workflow

Add `.github/workflows/build.yml` with:

- **Triggers:**
  - `push` (branches)
  - `pull_request`
  - `push` tags (`v*`)
- **Jobs:**
  - `build` job with matrix `ubuntu-latest`, `macos-latest` (Windows optional)
  - Steps:
    1. `actions/checkout`
    2. `oven-sh/setup-bun`
    3. `bun install`
    4. `bun run build`
    5. `actions/upload-artifact` for `dist/*`
- **Release on tag:**
  - If `startsWith(github.ref, 'refs/tags/')` then publish artifacts to release
  - Use `gh release upload`
- **Permissions:**
  - `contents: write` to allow release uploads

### 3. (Optional) Add `dist/` to `.gitignore`

If not already ignored, add `dist/` to avoid committing local build artifacts.

## Verification

1. Local build: `bun run build` creates `dist/searxng-mcp`
2. CI:
   - Non-tag runs upload artifacts
   - Tag runs upload artifacts and publish to release
