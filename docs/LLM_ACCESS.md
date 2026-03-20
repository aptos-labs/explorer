# LLM and crawler accessibility

Contributors should keep AI systems and search engines aligned with how the explorer routes and describes pages.

## Checklist when adding or changing routes or tabs

See **LLM / AI Accessibility** in the repo root [`AGENTS.md`](../AGENTS.md) (and `CLAUDE.md`): update `public/llms.txt`, `public/llms-full.txt`, and `public/sitemap.xml` where appropriate, plus structured data in [`app/components/hooks/usePageMetadata.tsx`](../app/components/hooks/usePageMetadata.tsx) for new page types.

## Page metadata

Prefer a **single source** for `<title>`, canonical URL, Open Graph, Twitter, and JSON-LD: the [`PageMetadata`](../app/components/hooks/usePageMetadata.tsx) component (via `react-helmet-async`). Avoid duplicating the same tags in TanStack Router route `head()` callbacks unless there is no page-level component yet.

## Drift tests

[`app/utils/llmsRouteCoverage.test.ts`](../app/utils/llmsRouteCoverage.test.ts) asserts that core path snippets appear in **both** `llms.txt` and `llms-full.txt`. When you add a major top-level area, extend `REQUIRED_PATH_SNIPPETS` and update the public docs.

## Public reference files

| File | Role |
|------|------|
| `public/llms.txt` | Short llmstxt.org-style summary |
| `public/llms-full.txt` | Full reference (routes, APIs, limitations) |
| `public/robots.txt` | Crawler rules; note `network=` query disallowances |
| `public/sitemap.xml` | Discoverable URLs including `llms.txt` / `llms-full.txt` |

Root [`app/routes/__root.tsx`](../app/routes/__root.tsx) exposes `<link rel="help">` / `alternate` hints to the LLM text files.
