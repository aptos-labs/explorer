# LLM and crawler accessibility

Contributors should keep AI systems and search engines aligned with how the explorer routes and describes pages.

**Cursor:** the project skill [`.cursor/skills/aptos-explorer-llm-seo/SKILL.md`](../.cursor/skills/aptos-explorer-llm-seo/SKILL.md) summarizes this workflow for coding agents.

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
| `public/robots.txt` | Crawler rules; note `network=` query disallowances and top-level `Content-Signal` directives |
| `public/sitemap.xml` | Discoverable URLs including `llms.txt` / `llms-full.txt` |
| `public/.well-known/api-catalog` | RFC 9727 API catalog (`application/linkset+json`) listing upstream Aptos REST / GraphQL APIs |
| `public/.well-known/agent-skills/index.json` | Agent Skills Discovery RFC v0.2.0 index; per-skill `SKILL.md` under `public/.well-known/agent-skills/*/` |
| `public/.well-known/mcp/server-card.json` | MCP Server Card (SEP-1649) describing WebMCP transport and tools |
| `public/.well-known/agent-card.json` | A2A Agent Card (skill/capability discovery; no JSON-RPC task endpoint) |
| `public/.well-known/oauth-protected-resource` | RFC 9728 PRM; empty `authorization_servers` (public site) |
| `public/auth.md` | Auth.md-style document: no agent registration / no OAuth AS |
| `vercel.json` | `framework: tanstack-start` (Nitro SSR, not Vite SPA); `Link` response headers (RFC 8288) on `/` and `/(.*)` pointing to the discovery files (static assets only) |
| `app/ssr.tsx` + `app/utils/markdownHomeNegotiation.ts` | Outer SSR `fetch` serves markdown for `Accept: text/markdown` **before** TanStack Start's HTML-only Accept gate, and attaches discovery `Link` / `Vary: Accept` on HTML SSR responses |
| `app/components/WebMCPProvider.tsx` + `app/components/webMcpTools.ts` | `navigator.modelContext` tools for browser-resident agents |

Root [`app/routes/__root.tsx`](../app/routes/__root.tsx) exposes `<link rel="help">` / `alternate` hints to the LLM text files and mounts `<WebMCPProvider />`.

### Regenerating the agent-skills index

When you edit any `SKILL.md` under `public/.well-known/agent-skills/`, run:

```bash
node scripts/update-agent-skills-index.mjs
```

to refresh `index.json` SHA-256 digests. The drift test `app/utils/agentSkillsIndex.test.ts` fails if digests are stale.

## Generated TanStack Router route tree

[`app/routeTree.gen.ts`](../app/routeTree.gen.ts) is **generated** (gitignored). Config: [`tsr.config.json`](../tsr.config.json) (must stay aligned with `TanStackRouterVite` in [`vite.config.ts`](../vite.config.ts)).

- **Local:** `pnpm routes:generate`, or it runs automatically before `dev`, `start`, `build`, `lint`, `test`, and `check` via `pre*` scripts.
- **CI / Vercel:** `pnpm build` and [`pnpm ci:verify`](../package.json) run generation first; clone + `pnpm install` then `pnpm lint` (or any of the above) recreates the file.

## DNS-AID and Web Bot Auth (not in this repo)

[isitagentready.com](https://isitagentready.com/explorer.aptoslabs.com) also checks:

- **DNS for AI Discovery (DNS-AID)** — SVCB/HTTPS (and optional TXT) at
  `_index._agents.explorer.aptoslabs.com` (scanner also probes
  `_a2a._agents` and `_mcp._agents`). `explorer.aptoslabs.com` is on Google
  Cloud DNS (`ns-cloud-d*.googledomains.com`); records must be added in that
  zone, preferably DNSSEC-signed. Example shape:

  ```
  _index._agents.explorer.aptoslabs.com. 3600 IN HTTPS 1 explorer.aptoslabs.com. alpn="h2" port=443
  ```

  See https://www.dns-aid.org/ and
  [draft-mozleywilliams-dnsop-dnsaid](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/).

- **Web Bot Auth** — `/.well-known/http-message-signatures-directory` is a
  JWKS for **outbound** signed bot requests. The explorer is a content site
  and does not publish signing keys. Do not add a dummy JWKS.
