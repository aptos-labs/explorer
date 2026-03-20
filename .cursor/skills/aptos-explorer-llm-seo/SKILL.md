---
name: aptos-explorer-llm-seo
description: >-
  Keeps Aptos Explorer discoverable for LLMs, crawlers, and SEO when routes,
  tabs, or page metadata change. Use when adding or renaming routes or tabs,
  editing PageMetadata/JSON-LD, updating public llms*.txt or sitemap, or when
  the user mentions LLM accessibility, llmstxt, structured data, or SEO for
  this repository.
---

# Aptos Explorer — LLM & SEO readiness

Canonical repo docs: **`AGENTS.md`** (LLM / AI Accessibility), **`docs/LLM_ACCESS.md`**.

## When routes or tabs change

Apply this checklist before merging:

- [ ] **`public/llms.txt`** — path patterns under the right section
- [ ] **`public/llms-full.txt`** — same patterns **plus** a short description of what the page shows; update **`> Last updated:`** at the top
- [ ] **`public/sitemap.xml`** — add URL if the page is static or semi-static and high value for discovery
- [ ] **`app/components/hooks/usePageMetadata.tsx`** — extend **`generateStructuredData`** with a new **`case`** if this is a **new page type** (not just another URL under an existing type)
- [ ] **Drift test** — if the area is important for tools, add a substring to **`REQUIRED_PATH_SNIPPETS`** in **`app/utils/llmsRouteCoverage.test.ts`** (must appear in **both** `llms.txt` and `llms-full.txt`)
- [ ] Run **`pnpm test --run`** (includes LLM doc coverage) and **`pnpm lint`**

**Removals/renames:** delete or update matching entries in **`llms.txt`**, **`llms-full.txt`**, and **`sitemap.xml`**.

## Page metadata (SSOT)

- Prefer **`PageMetadata`** in page components for title, description, canonical, OG/Twitter, and JSON-LD.
- Avoid duplicating the same tags in TanStack Router **`head()`** unless there is no page component yet. Root **`__root.tsx`** may keep global defaults only.
- Home search: when **`?search=`** is meaningful, keep **title/description** and optional **`searchQuery`** on **`PageMetadata`** aligned (see **`app/routes/index.tsx`**).

## Generated route tree

- **`app/routeTree.gen.ts`** is **generated** and **gitignored**. Config: **`tsr.config.json`** (keep in sync with **`TanStackRouterVite`** in **`vite.config.ts`**).
- After clone or route changes, **`pnpm routes:generate`** runs via **`pre*`** scripts before dev/build/lint/test; CI uses **`pnpm ci:verify`**.

## JSON-LD quick reference

| Page kind | Typical `type` prop | Schema notes |
|-----------|---------------------|----------------|
| Lists / indexes | `website` | Hub routes may get **`CollectionPage`** in **`generateStructuredData`** |
| Verification / long-form | `article` | **`Article`** block |
| Account / object | `account` / `object` | **`ProfilePage`** + **`mainEntity`** |
| Txn / block / coin / FA / token / validator | matching `PageType` | Existing **`switch`** cases; use path-safe **`identifier`** (decode segments when needed) |

Regression tests: **`app/components/hooks/usePageMetadata.structuredData.test.ts`** — extend when adding structured-data branches.

## Verification commands

```bash
pnpm routes:generate   # if working outside normal scripts
pnpm test --run        # llmsRouteCoverage + structured data tests
pnpm lint
```

## Optional

- Notable SEO/LLM-facing changes: one line in **`CHANGELOG.md`** under **[Unreleased]**.
- Root head hints: **`app/routes/__root.tsx`** (help / alternate links to LLM files).
