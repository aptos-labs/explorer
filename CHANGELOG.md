# Changelog

All notable changes to the Aptos Explorer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Settings page** (`/settings`): dedicated full-page settings replacing the old header popup dialog. Includes API key overrides (per network) and a new Move Bytecode Decompilation opt-in toggle
- **Decompilation opt-in**: decompiled and disassembly code views now require explicit user opt-in at `/settings`. Users must acknowledge a disclaimer that decompiled output may not match original source before the feature is enabled
- **Settings**: optional geomi.dev API key override can be set **per network** (instead of one key for all networks). Existing saved single keys are migrated to all networks on load until you save again.
- Features Specification (`docs/FEATURES_SPECIFICATION.md`): canonical catalog of every user-facing explorer feature with unique `FEAT-*` identifiers, test coverage map (Appendix B), and prioritized coverage gaps (Appendix C)
- `AGENTS.md`: regression prevention rules requiring agents to reference `docs/FEATURES_SPECIFICATION.md` when adding, modifying, or removing features and to keep the spec in sync with the codebase
- Behavioral tests for 25+ spec features covering search, transactions, accounts, validators, coins, tokens, network config, rate limiting, analytics, wallet, modules, SEO, and more — see `docs/FEATURES_SPECIFICATION.md` Appendix B for the full list
- Extracted pure redirect/navigation utilities into `app/utils/routeRedirects.ts` for testability (entity default tabs, token legacy redirects, validators redirects, header search routing, wallet network mismatch, portfolio URLs)
- **Decibel perps transaction parser**: transaction overview now shows human-readable action labels for Decibel perpetual exchange entry functions — order placement (limit, market, bulk, TWAP), order cancellation, deposit, and withdrawal actions display with amount, asset, and a link to the Decibel contract
- Rate-limit drawer: a bottom sheet appears when any API request receives HTTP 429, informing the user they have been rate-limited and offering a button to open Settings and set an API key override or wait ~5 minutes for the limit to reset
- **Trace tab failure highlighting**: when a transaction failed, the Trace tab shows an error banner with the VM status and visually highlights the failed call (red background, error chip with the abort reason) along with a dashed-red path from the root to the failing node

### Improved

- **Transaction events tab** (`/txn/.../events`): Fee Statement and Decibel formatted event views stack labels above values on small screens (below the `md` breakpoint) instead of squeezing two table columns; nested price/size tables use the same stacked pattern; tables stay in horizontal scroll containers on wider layouts. Raw JSON (`JsonViewCard`) respects the content width on narrow viewports. The event **Type** row uses a fit-width title column so long Move type strings wrap more predictably. Shared implementation: `ResponsiveKeyValueTable` / `ResponsiveKeyValueRow` (`app/components/Table/ResponsiveKeyValueTable.tsx`) for reuse across the explorer.
- **Transaction overview** (`/txn/.../userTxnOverview`): the **Signature** block uses the same outlined table layout as the Fee Statement event view—labeled rows for scheme, public key, and signature (with expandable hex chips)—instead of only a collapsible JSON tree. Pending transactions use the same presentation. On small screens, label and value stack vertically; wide content can scroll horizontally so nothing is clipped.
- **Account modules (Packages / Code / Run / View)**: loading and empty states no longer flash “No Data” while package metadata is still fetching; addresses without `PackageRegistry` or on-chain modules get clearer guidance instead of a generic empty state or misleading “Account Not Found”; on modules URLs, a 404 from the account-resources fetch no longer shows the account-not-found banner; Run/View show **“No modules found”** when the modules API returns 404
- **Settings**: API Key Overrides section includes an info icon with a short explanation of why to use your own geomi.dev key (dedicated rate limits) and a link to geomi.dev
- Rate-limit drawer is now non-blocking (persistent banner instead of modal overlay) so users can still interact with the page, settings, and navigation while the notice is visible
- Saving an API key in Settings automatically dismisses the rate-limit drawer and suppresses re-triggering for 10 seconds, preventing stale in-flight 429 responses from immediately re-showing the drawer

### Changed

- **Light theme**: neutral grey app background (`#ECEEF2`), white cards/panels, cooler borders, and soft grey stripes for tables and filled inputs instead of warm cream-on-bright-off-white; primary body text uses ink (`#171612`) for slightly softer contrast than pure black. Light `theme-color` meta updated to match the canvas.

### Fixed

- **Coins page** (`/coins`): changing verification filters or the Emojicoins toggle no longer freezes the tab when thousands of assets match — the table virtualizes rows via an on-demand `renderRow` path and scrolls inside a bounded-height container instead of allocating every row up front
- **Dev mode**: `useFeatureName()` now reads from a `feature_name` cookie or the `VITE_FEATURE_NAME` env var instead of always returning `"prod"` — the Development Mode banner, Early Development Mode banner, and dev-only UI (e.g. Aptos Names banner) are functional again
- **SSR dev server**: removed duplicate `tanstackRouter()` plugin from `vite.config.ts` — it conflicted with the code-splitting plugins already bundled inside `tanstackStart()`, causing `ReferenceError: TSRSplitComponent is not defined` on every SSR request during `pnpm dev`
- Transaction overview **Arguments** table: column widths follow content again (no fixed 100px/140px layout), so long argument names no longer overlap type chips; type badges stay on one line where possible; the **Arguments:** label row uses a compact title column so the table has more horizontal room
- Object account pages (e.g. Decibel perp DEX) crashing with "Cannot convert object to primitive value" — the `/account/` → `/object/` redirect now correctly passes TanStack Router's parsed search params instead of interpolating the search object in a URL template literal

### Removed

- AIP-141 gas impact UI: account **Gas Impact** tab, gas warnings on account transaction lists, and the user-transaction overview banner; removed `useGetGasScheduleVersion` and related utilities.

## [1.1.0] - 2026-03-23

### Added

- Known address **Greg** (greg.apt → `0xc675…edce9e`) with vendored profile image from @greg_nazario for explorer identicon and account banner (`public/address-icons/greg-nazario.jpg`)
- Module Code (and Run/View source panel): qualified `module::function` and `0x..::module::function` references in highlighted Move source navigate to the Code tab for that module/function (Cmd/Ctrl+click opens in a new tab)
- Known-address branding (per network): optional `icon` and `description` replace blockies where configured, render an account-page banner, and enrich metadata; Decibel on mainnet is the first entry (`app/data/mainnet/knownAddressBranding.ts`)
- Known-address `iconBadge` (e.g. `0x1` on the Aptos mark) for framework accounts; mainnet icons/descriptions for bridges, DEX deployers, and CEX-labeled wallets; framework branding shared on testnet/devnet (`app/data/aptosFrameworkAddressBranding.ts`, `public/address-icons/*`)
- CEX icons (Bybit, Bitfinex, Kraken, Gate.io, MEXC, Crypto.com, Flipster, Binance US): profile images from official X handles via `unavatar.io/twitter/...`, vendored as PNG under `public/address-icons/`
- `public/address-icons/*.png` raster assets normalized to **128×128** RGBA (aspect-preserving scale, transparent letterboxing), except **Decibel** which keeps its original PNG dimensions; SVG brand marks unchanged
- AnimeSwap: removed known-address **branding** (icon + banner copy); address label in `knownAddresses` unchanged
- Search (header autocomplete and inline `/` + `/search` results): token logos when available, otherwise blockies or known-address brand marks via `identiconKey` on `SearchResult` (`SearchResultAvatar`, `searchUtils.ts`)
- Known-address DEX/bridge marks: vendor favicons (or official SVG/avatars) for Tapp, Sushi, Panora, PancakeSwap, Liquidswap, Kana, Hyperion, Cellana, Cetus, Aux, Wormhole, LayerZero; Econia via @EconiaLabs (unavatar); AptoSwap via GitHub org avatar; remove Obric from named-address list and branding (`defunctProtocols` unchanged)
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

### Fixed

- Transaction page: the collapsible **Transaction Debug Info** block (full JSON + API link) appears only on the **Overview** tab, not under Events, Changes, Payload, etc.
- Module Code SSR/runtime: guard `_splat` parsing and highlight.js AST props so malformed router params or DOM attributes cannot trigger “Cannot convert object to primitive value”; normalize `className` to string arrays before `react-syntax-highlighter`’s `createElement`
- Module Code links: anchor `resolveMoveCodeLinkPath` regex with a non-capturing group; keyboard (Enter/Space) activates the same navigation as click; injected spans use `role="link"` + focusable `tabIndex` + `aria-label`
- SSR / Netlify functions: import `react-syntax-highlighter`’s **CJS** `create-element` helper (not the ESM subpath) so Node does not throw “Cannot use import statement outside a module” when rendering module code
- Account URL → object URL redirect preserves the path (e.g. `/modules/code/...`) instead of always landing on Transactions, so links to object-published module code resolve correctly

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
