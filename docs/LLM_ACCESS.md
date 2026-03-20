# LLM and crawler accessibility

Contributors should keep AI systems and search engines aligned with how the explorer routes and describes pages.

## Checklist when adding or changing routes or tabs

See **LLM / AI Accessibility** in the repo root [`AGENTS.md`](../AGENTS.md) (and `CLAUDE.md`): update `public/llms.txt`, `public/llms-full.txt`, and `public/sitemap.xml` where appropriate, plus structured data in [`app/components/hooks/usePageMetadata.tsx`](../app/components/hooks/usePageMetadata.tsx) for new page types.

## Page metadata

Prefer a **single source** for `<title>`, canonical URL, Open Graph, Twitter, and JSON-LD: the [`PageMetadata`](../app/components/hooks/usePageMetadata.tsx) component (via `react-helmet-async`). Avoid duplicating the same tags in TanStack Router route `head()` callbacks unless there is no page-level component yet.

## Drift tests

[`app/utils/llmsRouteCoverage.test.ts`](../app/utils/llmsRouteCoverage.test.ts) asserts that core path snippets appear in **both** `llms.txt` and `llms-full.txt`. When you add a major top-level area, extend `REQUIRED_PATH_SNIPPETS` and update the public docs.

## TanStack Router `head()` audit (2026-03-20)

Searched the app route tree for per-route `head:` callbacks (TanStack Router file routes under `app/routes/`).

**Finding:** Only [`app/routes/__root.tsx`](../app/routes/__root.tsx) defines `head()`. It sets global defaults (charset, viewport, baseline title/description, AI meta hints, font links). **No child route duplicates** `head()`; page-specific SEO and JSON-LD should continue to use [`PageMetadata`](../app/components/hooks/usePageMetadata.tsx) (`react-helmet-async`) so titles and canonical URLs stay in one place.

**When adding a route:** Prefer `PageMetadata` in the page component. Do not reintroduce route-level `head()` for the same tags unless there is no suitable layout component yet.

## Public reference files

| File | Role |
|------|------|
| `public/llms.txt` | Short llmstxt.org-style summary |
| `public/llms-full.txt` | Full reference (routes, APIs, limitations) |
| `public/robots.txt` | Crawler rules; note `network=` query disallowances |
| `public/sitemap.xml` | Discoverable URLs including `llms.txt` / `llms-full.txt` |

Root [`app/routes/__root.tsx`](../app/routes/__root.tsx) exposes `<link rel="help">` / `alternate` hints to the LLM text files.

## Generated TanStack Router route tree

[`app/routeTree.gen.ts`](../app/routeTree.gen.ts) is **generated** (gitignored). Config: [`tsr.config.json`](../tsr.config.json) (must stay aligned with `TanStackRouterVite` in [`vite.config.ts`](../vite.config.ts)).

- **Local:** `pnpm routes:generate`, or it runs automatically before `dev`, `start`, `build`, `lint`, `test`, and `check` via `pre*` scripts.
- **CI / Netlify:** `pnpm build` and [`pnpm ci:verify`](../package.json) run generation first; clone + `pnpm install` then `pnpm lint` (or any of the above) recreates the file.
