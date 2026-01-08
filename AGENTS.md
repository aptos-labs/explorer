# Repository Guidelines

Follow these notes to ship dependable updates to the Aptos Explorer codebase.

## Project Structure & Module Organization

- `app/` hosts the TanStack Start app; routes live in `app/routes`, shared UI in `app/components`, data hooks in `app/api/hooks`, context in `app/context`, and utilities in `app/utils`.
- `app/types` holds shared contracts; keep new types close to usage unless they are broadly shared.
- `src/` is legacy/compat code (mostly `src/components`); prefer `app/` unless you are updating an existing `src/` consumer.
- Static assets sit in `public/` and `app/assets`; instrumentation helpers live under `analytics/`.
- Generated output (`dist/`, `build/`, `.tanstack/`) is disposable.

## Build, Test, and Development Commands

- `pnpm install` syncs dependencies against the lockfile.
- `pnpm dev` launches the Vite dev server on port 3030.
- `pnpm start` launches the Vite dev server on port 3000.
- `pnpm build` bundles for production.
- `pnpm test` runs Vitest; add `--run` in CI for a non-watch pass.
- `pnpm lint` runs `tsc --noEmit` and ESLint; `pnpm fmt` applies Prettier.

## Coding Style & Naming Conventions

- Prettier enforces 2-space indentation, trailing commas, double quotes, and tight bracket spacing—do not override locally.
- Use functional React components with PascalCase file names (e.g. `AccountTable.tsx`); hooks and data fetchers use the `useX` prefix.
- Keep modules focused: default exports for entry points, named exports for shared pieces that need tree-shaking.

## Testing Guidelines

- Use Vitest for unit coverage; new specs mirror the source name (`foo.test.ts` or `Component.test.tsx`) beside the implementation.
- Mock network calls with React Query utilities or fixtures; never hit Aptos endpoints in tests.
- Target new logic paths, particularly formatting helpers and query transformers, and add regression specs when fixing bugs.

## Commit & Pull Request Guidelines

- Write concise, imperative commit subjects that may include a scope, e.g. `feat(network-select): exclude hidden networks from dropdown`.
- Bundle related changes only; confirm lint and test success before pushing.
- PRs need a short summary, linked issue when available, and screenshots or GIFs for UI adjustments.
- Tag domain reviewers (routing, analytics, data tables) and call out follow-up items or known gaps.

## Configuration Notes

- Copy `.env.local` to a personal `.env` and supply Aptos API values (`VITE_*` or `REACT_APP_*` prefixes) before builds.
- Never commit secrets; rely on runtime variables via `import.meta.env`.
