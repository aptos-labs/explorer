# Changelog

All notable changes to the Aptos Explorer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- LLM doc drift tests extended with additional path/tab snippets (`/validators/all`, transaction tabs, multisig, enhanced delegation, etc.) so `llms.txt` and `llms-full.txt` stay aligned
- JSON-LD `CollectionPage` structured data for network analytics (`/analytics`) and validator list tabs (`/validators/{tab}`), in addition to transactions/blocks/coins list hubs
- Contributor docs: `docs/LLM_ACCESS.md` TanStack Router `head()` audit (only root `head()`; child routes use `PageMetadata`)
- Function filter on transaction tables — filter by entry function ID (e.g. `0x1::coin::transfer`) via `?fn=` URL parameter across User Transactions (server-side), All Transactions (client-side), and Account Transactions (server-side) views
- Progressive Web App (PWA) support with service worker for offline caching
- Enhanced manifest.json with full PWA configuration (icons, screenshots, categories)
- Service worker with intelligent caching strategies for static assets, fonts, and API calls
- Netlify caching headers optimized for PWA assets (sw.js, manifest.json)
- Multi-agent documentation system with 7 specialized roles (Architect, Coder, Reviewer, Tester, QA/Auditor, Cost Cutter, Modernizer)
- Cross-tool compatibility with symlinks for Claude Code, Gemini, Warp, and GitHub Copilot
- Cursor IDE integration with role-specific rules (`.cursor/rules/`) and notepads (`.cursor/notepads/`)
- Antigravity support via `.agent/rules/`
- Mistral Vibe support via `.vibe/agents/` (TOML format)
- OpenCode support via `.opencode/agent/`
- Kanban-style task management in `.agents/tasks/`
- Issue tracking templates in `.agents/issues/`
- Task and issue templates in `.agents/templates/`
- Browser-persisted Settings dialog with a client-side geomi.dev API key override

### Changed

- Hash “pill” buttons (`HashType.OTHERS`, e.g. block hash) in light mode use `background.default` plus a hairline border so they read clearly on creme table rows (previously matched `neutralShade.darker` == `background.paper`)
- Semantic colors tuned for **WCAG 2.1 AA** text contrast in light and dark mode (links, disabled text, success/error/warning copy, JSON/code accents); added `aptosBrandColors.a11y.test.ts` regression checks
- Explorer UI typography and theme tokens aligned with Aptos Brand Guidelines: IBM Plex Sans (UI), IBM Plex Serif (display headings), IBM Plex Mono (data/code-adjacent UI) as specified stand-ins for Season / Akkurat Mono; tuned heading and label letter-spacing; semantic `info` / `divider` / `action` palette fields; antialiased text baseline; brand `theme-color` / PWA colors (`#0F0E0B`, `#F9F9F0`)
- ANS lookups now use the ts-sdk client (getPrimaryName, getAccountNames, getName) instead of the aptosnames.com public API; mainnet/testnet-only behavior and caching unchanged
- Enhanced `AGENTS.md` with comprehensive role definitions and workflow documentation
- Unified footer action link styling for consistency

---

## Template for Future Releases

## [X.Y.Z] - YYYY-MM-DD

### Added

- New features

### Changed

- Changes to existing functionality

### Deprecated

- Features that will be removed in future

### Removed

- Removed features

### Fixed

- Bug fixes

### Security

- Security improvements
