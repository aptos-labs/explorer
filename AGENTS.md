# Aptos Explorer - Agent Guidelines

This document serves as the canonical source of truth for AI coding assistants working on this repository. It is symlinked as `CLAUDE.md`, `GEMINI.md`, `WARP.md`, and `.github/copilot-instructions.md` for cross-tool compatibility.

## Quick Reference

```bash
pnpm install          # Install dependencies
pnpm routes:generate  # TanStack route tree (also runs before dev/build/lint/test via pre* scripts)
pnpm dev              # Dev server on port 3030
pnpm start            # Dev server on port 3000
pnpm build            # Production build
pnpm ci:verify        # Local CI: generate routes, lint, test, production build
pnpm test             # Run Vitest
pnpm lint             # TypeScript + Biome lint checks
pnpm fmt              # Apply Biome formatting
pnpm check            # Biome lint + format + organize imports
```

**Before committing**: Always run `pnpm fmt && pnpm lint` to ensure code quality.

---

## Project Structure

```
explorer/
├── app/                    # TanStack Start application
│   ├── routes/             # File-based routing
│   ├── components/         # Shared UI components
│   ├── api/hooks/          # React Query data hooks
│   ├── context/            # React context providers
│   ├── pages/              # Page components
│   ├── utils/              # Utility functions
│   ├── types/              # Shared TypeScript types
│   └── themes/             # Theme configuration
├── src/                    # Legacy/compat code (prefer app/)
├── public/                 # Static assets
├── analytics/              # SQL analytics queries
├── .agents/                # Task management (Kanban)
├── .cursor/                # Cursor IDE configuration
├── .agent/                 # Antigravity rules
├── .vibe/                  # Mistral Vibe agents
├── .opencode/              # OpenCode agents
└── dist/, build/           # Generated output (disposable)
```

---

## Agent Roles

This repository uses a multi-agent workflow with 7 specialized roles. Each role has specific responsibilities and outputs.

### 1. Architect

**Focus**: Product roadmap and technical architecture

**Responsibilities**:

- Plan features based on user needs and existing code patterns
- Design system architecture, data flows, and component hierarchies
- Identify dependencies and integration points
- Create technical specifications and ADRs (Architecture Decision Records)
- Define tasks for other roles in `.agents/tasks/`

**Key Files to Review**:

- `app/router.tsx`, `app/routes/` - Routing architecture
- `app/api/hooks/` - Data fetching patterns
- `app/context/` - State management
- `netlify.toml` - Deployment configuration

**Outputs**: Architecture docs, task definitions in `.agents/tasks/backlog.md`

---

### 2. Coder

**Focus**: Implementation with comprehensive tracking

**Responsibilities**:

- Implement features according to Architect specifications
- Write clean, maintainable TypeScript/React code
- Add inline `// TODO:` comments for follow-up items
- Create issue files in `.agents/issues/` for bugs discovered
- Update `CHANGELOG.md` with notable changes
- Follow existing patterns in the codebase

**Code Style**:

- Functional React components with PascalCase filenames
- Hooks use `useX` prefix (e.g., `useAccountData`)
- 2-space indentation, double quotes, trailing commas (Biome enforced)
- Default exports for entry points, named exports for shared utilities

**Outputs**: Working code, TODO comments, issue files, CHANGELOG entries

> **When adding or removing routes/tabs**: Update `public/llms.txt`, `public/llms-full.txt`, and `public/sitemap.xml`. See the [LLM / AI Accessibility](#llm--ai-accessibility) section for the full checklist.

---

### 3. Reviewer

**Focus**: Code quality across style, logic, and performance

**Responsibilities**:

- Verify code follows project conventions and patterns
- Check logic correctness and edge case handling
- Assess performance implications (re-renders, bundle size)
- Ensure proper error handling and loading states
- Validate TypeScript types are accurate and complete

**Review Checklist**:

- [ ] Follows existing code patterns
- [ ] No unnecessary re-renders or state updates
- [ ] Proper error boundaries and fallbacks
- [ ] TypeScript strict mode compliance
- [ ] No hardcoded values that should be constants
- [ ] Accessible (proper ARIA attributes, keyboard navigation)
- [ ] If routes/tabs were added or changed: `llms.txt`, `llms-full.txt`, and `sitemap.xml` updated

**Outputs**: Review feedback, approval or change requests

---

### 4. Tester

**Focus**: Unit, E2E, and visual regression testing

**Responsibilities**:

- Write Vitest unit tests for utilities and hooks
- Create component tests with React Testing Library
- Design E2E test scenarios for critical user flows
- Set up visual regression tests for UI components
- Maintain test fixtures and mocks

**Testing Guidelines**:

- Test files: `*.test.ts` or `*.test.tsx` beside implementation
- Mock network calls - never hit real Aptos endpoints in tests
- Focus on behavior, not implementation details
- Target formatting helpers, query transformers, and edge cases

**Commands**:

```bash
pnpm test              # Run all tests (watch mode)
pnpm test --run        # Single run (CI mode)
pnpm test <pattern>    # Run specific tests
```

**Outputs**: Test suites, coverage reports, regression test baselines

---

### 5. QA/Auditor

**Focus**: Security and performance assurance (balanced)

**Responsibilities**:

- **Security**: XSS prevention, API key exposure, wallet interaction safety
- **Performance**: Bundle analysis, render performance, API efficiency
- Audit third-party dependencies for vulnerabilities
- Review Content Security Policy and headers
- Check for data leaks in error messages or logs

**Security Checklist**:

- [ ] No secrets in client code (use `import.meta.env`)
- [ ] User input sanitized before rendering
- [ ] External links use `rel="noopener noreferrer"`
- [ ] Wallet transactions properly validated
- [ ] No sensitive data in localStorage without encryption

**Performance Checklist**:

- [ ] Components properly memoized where needed
- [ ] Images optimized and lazy-loaded
- [ ] Code splitting for route-based chunks
- [ ] API calls deduplicated with React Query
- [ ] No unnecessary dependencies in bundle

**Outputs**: Audit reports, security fixes, performance optimizations

---

### 6. Cost Cutter

**Focus**: Netlify deployment cost optimization

**Responsibilities**:

- Optimize bandwidth usage (caching, compression, CDN)
- Improve serverless function efficiency (SSR, cold starts)
- Reduce build minutes through caching strategies
- Monitor and optimize build output size
- Review `netlify.toml` configuration

**Optimization Areas**:

- **Bandwidth**: Aggressive caching headers, Brotli compression, image optimization
- **Functions**: Minimize SSR payload, reduce cold start time, edge functions
- **Build**: Incremental builds, dependency caching, parallel tasks

**Key Files**:

- `netlify.toml` - Headers, caching, build config
- `vite.config.ts` - Build optimization settings
- `app/ssr.tsx` - Server-side rendering

**Outputs**: Cost analysis, optimization PRs, build improvements

---

### 7. Modernizer

**Focus**: Framework updates, refactoring, and deprecation removal

**Responsibilities**:

- Monitor dependency updates via `renovate.json`
- Plan and execute major version upgrades
- Migrate legacy `src/` code to modern `app/` patterns
- Remove deprecated APIs and update to recommended alternatives
- Adopt new language features (TypeScript, ES2024+)
- Document migration paths and breaking changes

**Priority Areas**:

- React, TanStack Router/Query version updates
- Vite and build tooling upgrades
- TypeScript strict mode improvements
- Legacy component migration from `src/components/`

**Outputs**: Migration PRs, upgrade guides, deprecation removal

---

## Task Management (Kanban)

Tasks flow through stages in `.agents/tasks/`:

```
backlog.md → ready.md → in-progress.md → review.md → done.md
```

### Task Format

```markdown
## [TASK-001] Task Title

**Role**: Coder
**Priority**: High | Medium | Low
**Created**: 2026-01-09
**Status**: In Progress

### Description

What needs to be done.

### Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

### Notes

Additional context or decisions.
```

### Issue Tracking

Create issues in `.agents/issues/` with format: `YYYY-MM-DD-short-description.md`

---

## Commit Guidelines

Write concise, imperative commit messages with optional scope:

```
feat(network-select): add localnet detection
fix(api): handle rate limiting errors gracefully
refactor(hooks): migrate useAccountData to v2 API
docs(agents): add QA auditor role
chore(deps): update tanstack-query to v5
```

**Before committing**:

1. Run `pnpm fmt` to format code
2. Run `pnpm lint` to check for errors
3. Run `pnpm test --run` if you modified testable code
4. Write a descriptive commit message

---

## Environment Configuration

Copy `.env.local` to `.env` and configure:

```bash
VITE_API_URL=...           # Aptos API endpoint
VITE_GRAPHQL_URL=...       # GraphQL endpoint
# Add other VITE_* or REACT_APP_* variables as needed
```

**Never commit secrets** - use runtime environment variables.

---

## Tool-Specific Rules

Role-specific rules are available in tool-native formats:

| Tool         | Location               |
| ------------ | ---------------------- |
| Cursor       | `.cursor/rules/*.mdc`  |
| Antigravity  | `.agent/rules/*.md`    |
| Mistral Vibe | `.vibe/agents/*.toml`  |
| OpenCode     | `.opencode/agent/*.md` |

---

## LLM / AI Accessibility

The explorer maintains dedicated documentation for AI systems and LLM-powered tools. These files must be kept accurate — stale or incomplete content directly degrades the ability of AI assistants to route users to the correct pages.

### Files to Maintain

| File | Purpose | Update when |
| --------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| `public/llms.txt` | Short LLM reference (llmstxt.org standard) | Any route or tab is added/changed/removed |
| `public/llms-full.txt` | Full LLM reference with API docs and examples | Same as above, plus stack/feature changes |
| `public/robots.txt` | Bot crawl rules including named AI crawlers | New AI crawler agents become prominent |
| `public/sitemap.xml` | Static URL list for crawlers | New high-value static or semi-static pages |
| `app/components/hooks/usePageMetadata.tsx` | JSON-LD structured data per page type | New page types or schema improvements |
| `app/routes/__root.tsx` | Root `<head>` AI meta tags and LLM doc link hints | Site-level description or topic changes |
| `docs/LLM_ACCESS.md` | Contributor quick reference (metadata SSOT, drift tests) | When LLM/SEO workflow changes |
| `app/utils/llmsRouteCoverage.test.ts` | Ensures `llms.txt` / `llms-full.txt` keep core path snippets | When extending documented routes |

### Route / Tab Checklist

When you **add a new route or tab**, update all of the following:

- [ ] `public/llms.txt` — add the path pattern under the correct section
- [ ] `public/llms-full.txt` — add the path pattern **and** a description of what the page shows; update the "Last updated" date at the top
- [ ] `public/sitemap.xml` — add an entry if the page is static or semi-static (e.g., a framework account page, a well-known coin)
- [ ] `app/components/hooks/usePageMetadata.tsx` — add a `case` in `generateStructuredData` if the page needs a new entity-specific JSON-LD schema

When you **remove or rename a route**, remove or update the corresponding entries in all four files.

### llms-full.txt Conventions

- The `> Last updated:` line at the top must be updated to today's date on every substantive edit.
- Tab paths must be listed as full path examples, not just tab names.
- Any new external API the explorer starts consuming (e.g., a new price feed) should be added to the "API Endpoints Used by the Explorer" section.
- The "Technical Stack" section should reflect the major version of React, TypeScript, MUI, and Vite currently in `package.json`.

### Structured Data Conventions

- Every new **page type** (e.g., a new entity like "collection" or "multisig") should get a `case` in `generateStructuredData()` in `usePageMetadata.tsx` with an appropriate schema.org type and an `identifier` field extracted from the canonical URL.
- The `WebSite` schema's `potentialAction: SearchAction` uses `/?search={search_term_string}` — update the `urlTemplate` if the search URL pattern changes.

---

## Getting Help

- **Architecture questions**: Check `app/router.tsx` and route files
- **Data fetching**: See patterns in `app/api/hooks/`
- **Styling**: Review existing components in `app/components/`
- **Deployment**: Check `netlify.toml` and `RATE_LIMITING.md`
- **Caching & refresh times**: See `CACHING.md`
- **Context optimization**: See `CONTEXT_OPTIMIZATION.md`
- **LLM/AI discoverability**: See `docs/LLM_ACCESS.md`, `public/llms.txt`, `public/llms-full.txt`, and `public/robots.txt`
- **Search URL for AI links**: `/?search={query}` — the home page search bar accepts this param and shows inline results
