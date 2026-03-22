# Changelog

All notable changes to the Aptos Explorer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Known-address branding (per network): optional `icon` and `description` replace blockies where configured, render an account-page banner, and enrich metadata; Decibel on mainnet is the first entry (`app/data/mainnet/knownAddressBranding.ts`)
- Known-address `iconBadge` (e.g. `0x1` on the Aptos mark) for framework accounts; mainnet icons/descriptions for bridges, DEX deployers, and CEX-labeled wallets; framework branding shared on testnet/devnet (`app/data/aptosFrameworkAddressBranding.ts`, `public/address-icons/*`)
- CEX icons (Bybit, Bitfinex, Kraken, Gate.io, MEXC, Crypto.com, Flipster, Binance US): profile images from official X handles via `unavatar.io/twitter/...`, vendored as PNG under `public/address-icons/`
- `public/address-icons/*.png` raster assets normalized to **128×128** RGBA (aspect-preserving scale, transparent letterboxing); SVG brand marks unchanged
- Search (header autocomplete and inline `/` + `/search` results): token logos when available, otherwise blockies or known-address brand marks via `identiconKey` on `SearchResult` (`SearchResultAvatar`, `searchUtils.ts`)
- Known-address DEX/bridge marks: vendor favicons (or official SVG/avatars) for Tapp, Sushi, Panora, PancakeSwap, Liquidswap, Kana, Hyperion, Cellana, Cetus, Aux, Wormhole, LayerZero; Econia via @EconiaLabs (unavatar); AptoSwap via GitHub org avatar; AnimeSwap via @AnimeSwapAptos (unavatar); remove Obric from named-address list and branding (`defunctProtocols` unchanged)
- GitHub Actions workflow **CI** (`pnpm ci:verify`: generate TanStack route tree, lint, test, production build)
- `tsr.config.json` and `@tanstack/router-cli` so `app/routeTree.gen.ts` can be regenerated without starting Vite; file is gitignored and produced before dev/build/lint/test via `pre*` scripts
- LLM doc drift tests extended with additional path/tab snippets (`/validators/all`, transaction tabs, multisig, enhanced delegation, etc.) so `llms.txt` and `llms-full.txt` stay aligned
- JSON-LD `CollectionPage` structured data for network analytics (`/analytics`) and validator list tabs (`/validators/{tab}`), in addition to transactions/blocks/coins list hubs
- Contributor docs: `docs/LLM_ACCESS.md` TanStack Router `head()` audit (only root `head()`; child routes use `PageMetadata`)
- JSON-LD: `Article` for `type="article"` pages; home `?search=` aligns title/description and sets `WebPage.about`; Vitest coverage for `generateStructuredData`
- SEO: avoid empty-segment canonical URLs on coin / FA / account / token titles; `.node-version` + CI pins pnpm `10.32.1` and Node from file
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
