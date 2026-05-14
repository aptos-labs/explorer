# Changelog

All notable changes to the Aptos Explorer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **PWA share button**: When the explorer is launched as an installed Progressive Web App (display-mode `standalone` or `window-controls-overlay`, plus legacy iOS `navigator.standalone`), the persistent header now shows a Share icon on every page. Tapping it opens the OS share sheet via `navigator.share` with the current page URL and title; on platforms without Web Share, it falls back to copying the URL to the clipboard and shows a "Link copied to clipboard" snackbar. The button is hidden in regular browser tabs to avoid duplicating the address-bar share/copy action. New `useIsStandalonePWA` hook (`app/hooks/useIsStandalonePWA.ts`) and `sharePage` helper (`app/components/layout/sharePage.ts`) cover the detection and share/clipboard logic with unit tests.
- **Share button shown in iframe embeddings**: The header Share icon now also appears when the explorer is running inside an iframe (same-origin or cross-origin), not just when installed as a PWA. Like a standalone PWA, an embedded iframe hides the browser address bar and its native share/copy affordance, so surfacing an in-app Share action keeps current-URL sharing one tap away. Detection is handled by a new `useIsInIframe` hook (`app/hooks/useIsInIframe.ts`, SSR-safe; treats cross-origin `window.top` access errors as "framed") with unit tests covering top-level, same-origin frame, and cross-origin frame cases.

### Changed

- **Material UI v7 → v9 upgrade**: `@mui/material` and `@mui/icons-material` bumped from `7.3.10` to `9.0.1` (MUI skipped v8). The official `@mui/codemod@9.0.1 v9.0.0/system-props` codemod migrated ~400 system shorthand props (`mt`, `mb`, `p`, `display`, `gap`, `width`, `bgcolor`, etc.) on `Box` / `Stack` / `Typography` / `Link` / `Grid` into the `sx` prop. Manual fixes: `TextField`'s `InputProps` / `InputLabelProps` → `slotProps.input` / `slotProps.inputLabel`; `Dialog` / `Menu` / `Select` `PaperProps` → `slotProps.paper`; `Menu` `MenuListProps` → `slotProps.list`; `Switch` `inputProps` → `slotProps.input`; `ListItemText` `primaryTypographyProps` → `slotProps.primary`; `FormControlLabel` `componentsProps` → `slotProps`; `DialogTitle`/`TooltipTypography` `textAlign`/`fontWeight` props → `sx`. v9 narrows `Grid` `direction` to `'row' | 'row-reverse'`, so `direction="column"` (including responsive forms) was moved to `sx.flexDirection`. Several `@mui/icons-material` modules were renamed (`ErrorOutline` → `ErrorOutlineOutlined`, `HelpOutline` → `HelpOutlineOutlined`, `CheckCircleOutline` → `CheckCircleOutlineOutlined`); imports were updated with aliases to preserve in-file naming. The autocomplete-driven `SearchInput` was updated to read the new `params.slotProps.input` / `htmlInput` shape. Theme: removed an invalid `mt: 5` no-op from `MuiList.styleOverrides.root`. No user-visible behavior changes are intended.
- **Light/dark mode toggle moved into the menu on every viewport**: The dedicated dark-mode icon button has been removed from the header toolbar. The theme toggle now lives exclusively inside the new `HeaderOverflowMenu` (renamed from the former `NavMobile`, which is no longer mobile-only), rendered on **all** viewports — on compact viewports (`xs`–`md`) it continues to act as the primary navigation menu (with Transactions, Validators, Blocks, etc., plus the wallet connector), and on wide viewports (`lg+`) it collapses to a small "preferences" drop-down anchored next to the Settings icon containing just the "Switch to light mode" / "Switch to dark mode" item. This replaces the previous behavior where the menu only carried the toggle when running as a mobile PWA, and removes the special-case branching from `Header.tsx`.

### Changed

- **lint-staged upgraded to v17**: Bumped `lint-staged` from `16.4.0` to `17.0.2`. v17 drops Node.js < 22.22.1 support; the repo already targets Node 24 via `.node-version`, so contributors are unaffected. The existing `lint-staged` config (`*` → `biome check --write --no-errors-on-unmatched`) is unchanged.
- **Stricter type-only import enforcement**: TypeScript `verbatimModuleSyntax` is now enabled (`tsconfig.json`) and Biome's `useImportType` was promoted from `warn` to `error` (`biome.json`). Type-only imports must be marked with `import type` (and type-only re-exports with `export type`); the compiler / linter will reject value-form imports of types instead of allowing them through with a warning. The codebase already complied with both rules under the previous warn-level enforcement, so this commit contains no source changes — it just prevents regressions in future PRs. This is also a prerequisite for confident bundle-size work on `@aptos-labs/ts-sdk`: with type-only imports guaranteed-erased, the only remaining bundle-size lever is the path-import shape of the runtime-value imports.
- **pnpm 11 migration — single-file configuration**: Upgraded `packageManager` from `pnpm@10.33.2` to `pnpm@11.1.1` and consolidated all pnpm settings into a new `pnpm-workspace.yaml` (the v11 SSOT). `.npmrc` is gone, and the `pnpm` block has been removed from `package.json`. Settings now live in camelCase under `pnpm-workspace.yaml`: `registry`, `autoInstallPeers`, `strictPeerDependencies`, `minimumReleaseAge` / `minimumReleaseAgeExclude`, `overrides`, `patchedDependencies`, and the renamed `allowBuilds` map (replaces v10's `onlyBuiltDependencies`; v11 requires an explicit `true`/`false` per build-script-bearing dependency, so `@swc/core` and `esbuild` are now `true` while `@parcel/watcher` and `sharp` are pinned to `false` to match the previous v10 deny-by-default behavior). `pnpm-lock.yaml` was regenerated under v11. `@aptos-labs/ts-sdk` was added to `minimumReleaseAgeExclude` as a temporary in-window exception (audit and remove after the version ages past the 7-day cutoff). CI is unaffected: `pnpm/action-setup@v6` reads the version from `packageManager`, so the bump cascades automatically.
- **Coin / FA properties — manual override registry**: The "Mintable / Burnable / Freezable / Dispatchable" chips on Coin and Fungible Asset detail pages can now be overridden per network via `app/data/{mainnet,testnet,devnet}/coinPropertyOverrides.ts`. Overrides are partial (any flag you omit still falls back to the value derived from on-chain refs) and can key off either the legacy coin struct (e.g. `0x…::propbase_coin::PROPS`) or the FA metadata object address. First override: **Propbase PROPS** on mainnet now displays as not mintable, not burnable, and not freezable to reflect the issuer's destroyed `MintRef` / `BurnRef` / `TransferRef` capabilities, even though the on-chain resources would otherwise mark those refs as present.
- **Deploy / markdown negotiation**: Homepage `Accept: text/markdown` handling now runs in the TanStack Start SSR handler (bundled `llms.txt` via `app/utils/markdownHomeNegotiation.ts`) instead of a Netlify Edge Function, so deploys no longer register `netlify/edge-functions`.
- **SSR server entry**: `vite.config.ts` now sets `server.entry: "ssr"` so production uses `app/ssr.tsx` (cache-aware `Cache-Control` and markdown negotiation) instead of the framework default server stub.

### Security

- **pnpm 7-day minimum release age + exact version pinning**: `.npmrc` now sets `minimum-release-age=10080` (minutes), so `pnpm install` refuses to pick up any package version published in the last 7 days — including transitive ones referenced by the lockfile. This mitigates fast-moving supply-chain attacks (compromised maintainer tokens, malicious dependency releases) by giving the community time to detect and yank bad versions before they enter the explorer's dependency graph. Paired with this, every direct dependency in `package.json` (`dependencies`, `devDependencies`) and every entry in `pnpm.overrides` is now pinned to an exact version instead of a `^`/`~`/`>=` range, so `pnpm install` (and Renovate-driven bumps) cannot silently float the resolved version when the lockfile is regenerated. The only escape hatch is a narrow `minimum-release-age-exclude[]=fast-uri` in `.npmrc`, because the currently-locked `fast-uri@3.1.2` sits right on the 7-day boundary; the exclusion should be removed once that version ages past the cutoff. Requires pnpm ≥ 10.16; the repo already pins `pnpm@10.33.0` via `packageManager`. No installed package versions changed — the lockfile diff is specifier-only churn.
- **AIPs author cleanup — defense-in-depth against incomplete sanitization**: the `cleanAuthors` helper now runs its `<...>` and `(...)` strip regexes in a fixed-point loop (until the string stops changing) and finishes with a sweep that removes any stray angle brackets/parens, addressing the CodeQL "Incomplete multi-character sanitization" finding. Author values are still rendered as React text (never as HTML), but the explorer now reduces nested patterns like `<<script>>` cleanly to nothing instead of leaving a stray `>`. Test mocks in `useGetReleases.test.ts` were also tightened from `url.includes("registry.npmjs.org")` to exact `new URL(url).hostname === "registry.npmjs.org"` checks (CodeQL "Incomplete URL substring sanitization").
- **AIPs fetch — scope GitHub auth to api.github.com only**: `fetchAIPs` no longer attaches the `Authorization` header (or any custom GitHub-API header) to `raw.githubusercontent.com` requests. Sending those headers cross-origin to a host that doesn't accept them triggers a CORS preflight that the raw host doesn't answer, which would silently drop most AIP rows. Auth headers are now only sent to `api.github.com`.
- **`.env.example` GitHub PAT guidance**: the `VITE_GITHUB_TOKEN` block now spells out that any `VITE_`-prefixed env var ships in client JS and must therefore not be a credential meant to remain secret. The variable remains supported for local development against the GitHub API rate limit, but the example now explicitly recommends unauthenticated requests (or a server-side proxy) for deployed environments.

### Fixed

- **Validators — All Nodes when mainnet stats JSON is empty**: The explorer merges off-chain `validator_stats_v2.json` with on-chain `ValidatorSet` for the validators table and map. When that JSON is empty (for example a stalled upload to the stats bucket), the UI used to show no rows and no map markers even though the chain still reported active validators. The merge step now falls back to on-chain rows so voting power and addresses stay visible; operator addresses are filled from each pool’s `0x1::stake::StakePool` when the stats file is empty. Rewards performance, last epoch performance, and geo columns stay sparse until the JSON is restored.

- **Transaction function filter now uses indexed columns**: the "Filter by Entry Function" UI on `/transactions` (User Transactions tab) and per-account transaction pages now queries the `entry_function_contract_address`, `entry_function_module_name`, and `entry_function_function_name` columns instead of the un-indexed `entry_function_id_str` column. This fixes timeouts / errors when filtering by function. The filter UI now shows three separate fields (Contract Address, Module, Function) so users can filter by any combination without having to know the full `address::module::function` string.
- **Netlify SSR function — `TypeError: y.handler is not a function`**: After moving the SSR entry to `app/ssr.tsx` (`vite.config.ts` `server.entry: "ssr"`), the deployed Netlify Function failed at runtime with `TypeError: y.handler is not a function` and broke `explorer.aptoslabs.com`. `@netlify/vite-plugin` writes a wrapper that does `serverEntrypoint.fetch` on the SSR module's default export, but `app/ssr.tsx` exported the handler returned by `createStartHandler(...)` directly (a callable, not `{ fetch }`), so `.fetch` resolved to `undefined` and the lambda runtime failed when it tried to call the handler. The default export is now wrapped in `{ fetch }` to match the framework's own `default-entry/server.js` shape, which restores SSR.

- **Netlify markdown Edge Function — `context.fetch` not a function**: Production logs showed `TypeError: context.fetch is not a function` inside `markdown-negotiation` when the handler tried to load `/llms.txt` via Netlify’s `Context.fetch` API. That runtime mismatch caused the edge layer to error for affected homepage requests (for example, clients sending `Accept: text/markdown`) instead of falling through to SSR. Markdown negotiation was moved to TanStack Start SSR with bundled `llms.txt`, which avoids `context.fetch` entirely.

- **Network deployments — framework release uses gas schedule**: `/releases/networks` cards no longer label `0x1::version::Version.major` as “framework version”. The UI now shows **Framework Release** from `0x1::gas_schedule::GasScheduleV2.feature_version`, mapped to the framework train per aptos-core `gas_feature_versions`, plus **Bytecode Format (max)** from VM Binary Format feature flags.

- **Network deployments — release branch URL never points to a non-existent branch**: the commit-message parser used to accept three-component release tags like `[aptos-release-v1.43.1]` (the patch-suffixed form is malformed; Aptos cuts release branches per minor only). When such a tag slipped through, the network card on `/releases/networks` rendered `v1.43.1.x` and linked to `aptos-release-v1.43.1`, which 404s. The parser now only accepts the canonical `[aptos-release-vX.Y]` form and the consumer adds a defensive `^\d+\.\d+$` guard, so malformed tags fall back to the commit-only display rather than producing a broken link.
- **Releases hub — preserve `?network=` across unknown-tab redirect**: `/releases/<garbage>?network=testnet` used to redirect to `/releases/networks` (correct) but drop the `?network=testnet` selection (wrong), bouncing users back to mainnet. The redirect now forwards the `network` search param so the chain selection survives the bounce.
- **Mobile nav — single Releases entry**: the hamburger menu used to list "Deployments", "AIPs", and "Releases" as three separate items even though the desktop nav and `/releases` consolidation collapse them into one tabbed hub. Mobile now matches: one **Releases** entry that lands on the Networks tab.
- **Feature Flags by Network — distinct unknown state**: when a per-network query fails (e.g. fullnode unreachable), the comparison table on `/releases/networks` previously kept showing a spinner for that network's column, indistinguishable from a still-loading state. Failed networks now render a warning icon ("Network unreachable — value unknown") instead, matching the existing "Cells for those networks show as unknown" copy.
- **Releases hub — reject unknown tab values**: visiting `/releases/<garbage>` used to silently render the default Networks tab while leaving the bad URL in the address bar (creating duplicate-content URLs and broken bookmarks). The route now validates `params.tab` in `beforeLoad` and 302-replaces unknowns with `/releases/networks`.

- **AIPs status — strip trailing comments**: AIP frontmatter sometimes annotates the `Status:` field with a YAML-style comment like `Status: Draft # discussion: https://...`. The explorer's lightweight frontmatter parser now drops the ` #` and everything after it (for unquoted scalar values, matching YAML 1.2 semantics), so the AIPs table shows `Draft` rather than the full annotated string. Quoted values that contain `#` characters are preserved verbatim.
- **AIPs author — strip emails and github links**: AIP authors are written in many shapes (`Alice <alice@example.com>`, `[Alice](https://github.com/alice)`, `Alice (@alice)`, etc.). The AIPs table now runs each comma-separated author through a cleanup pass that drops angle-bracketed emails/URLs, parenthesized URLs and `@handles`, markdown link wrappers (keeping the link text), and bare `https://...` URLs, so each row shows just the names — e.g. `Alice <a@b.io>, Bob (@bob)` becomes `Alice, Bob`. Plain handles (`davidiw, wrwg, msmouse`) flow through unchanged.

### Changed

- **Releases / Feature flags**: Registered Aptos feature flag **112** as “Versioned Transaction Validation”. For IDs not yet in the explorer’s static list, names are now resolved on the fly from the aptos-core `FeatureFlag` enum (via a CORS-friendly mirror), falling back to “Feature #N” only when that fetch fails.

- **Header — compact layout earlier on medium widths**: the main nav, wallet, and settings now switch to the hamburger menu at the `lg` breakpoint (~1200px) instead of `md` (~900px), so the top bar no longer crowds or clips between those widths.
- **Releases hub mobile polish**: AIPs table now puts a "Open on GitHub" icon button as the leading column instead of a "View →" link buried at the right; the Author column collapses on screens narrower than `sm` (~600px) so the title stays readable; long titles wrap with `word-break` rather than overflowing. The Feature Flags by Network comparison table now scrolls horizontally on small screens instead of squishing names ("Disallow init_module to Publish Modules (rolled out)" etc.) and wraps long names within the cell on tablet widths. The "Recent releases" inner table on each SDK/tool card keeps its publish-date column on a single line and lets long pre-release version strings wrap. Each network card row now wraps long monospace values (like the node commit short hash and release branch label) instead of letting them overflow the card.
- **Releases hub consolidates Deployments, AIPs, and SDK & Tool Releases under one nav entry** (`/releases`): the previously separate top-level pages `/deployments`, `/aips`, and `/releases` are now sub-tabs of a single Releases page (`/releases/networks`, `/releases/aips`, `/releases/sdks`). The header nav exposes a single **Releases** entry instead of three. Bare `/releases` redirects to the default `networks` tab; `/deployments` and `/aips` permanently redirect to `/releases/networks` and `/releases/aips` so existing bookmarks and external links keep working. `llms.txt`, `llms-full.txt`, `sitemap.xml`, and the LLM-doc drift test were updated to document the new paths.

### Added

- **Transaction detail — Modules tab**: When a transaction publishes or upgrades Move packages (`PublishPackage` events) or touches module bytecode (`write_module` / `delete_module` write-set changes), the explorer shows a **Modules** tab before **Changes** with publish addresses and per-module rows (with links to the account module code view when the module name is known).

- **Confidential assets — aggregate supply and account hints**: fungible asset and coin info tabs show **Confidential supply (pool)** from `0x1::confidential_asset::get_total_confidential_supply` when the view succeeds. The account **Coins** tab calls `has_confidential_store` per FA metadata (v2 balances, or v1 when Panora lists a paired `faAddress`); when initialized, the row shows the actual visible balance/USD and a new **Confidential** column displays a `VisibilityOff` icon (with tooltip) signalling that an additional encrypted balance exists. Mobile card view shows the same icon next to the verification badge.

- **Agent-readiness discovery surfaces**: the explorer now ships structured metadata for autonomous agents and LLM-powered crawlers:
  - `Link` response headers (RFC 8288) on `/` and `/*` advertising the API catalog, the Agent Skills index, MCP Server Card, `llms.txt`, `llms-full.txt`, and the sitemap
  - `/.well-known/api-catalog` (RFC 9727 / RFC 9264 linkset JSON) pointing to the upstream Aptos fullnode REST APIs (mainnet/testnet/devnet), the indexer GraphQL API, and the explorer itself
  - `/.well-known/agent-skills/index.json` plus per-skill `SKILL.md` bundles (`aptos-explorer-urls`, `aptos-explorer-search`) following the Agent Skills Discovery RFC v0.2.0, with SHA-256 digests
  - `/.well-known/mcp/server-card.json` (SEP-1649 / SEP-2127 draft) describing the Explorer server, WebMCP transport endpoint, and read-only navigation tool capabilities for pre-connection MCP agent discovery
  - `scripts/update-agent-skills-index.mjs` helper to regenerate the discovery index when skills change
  - `robots.txt` `Content-Signal` directives — `ai-train=no, search=yes, ai-input=yes` — at the top of the file and inside every AI-crawler group (contentsignals.org / draft-romm-aipref-contentsignals)
  - SSR markdown negotiation (`app/utils/markdownHomeNegotiation.ts`) that serves the homepage as `Content-Type: text/markdown` (backed by bundled `llms.txt`) when the request includes `Accept: text/markdown`; HTML remains the default for browsers
  - WebMCP `navigator.modelContext` tools (`search_explorer`, `open_transaction`, `open_account`, `open_block`, `open_releases`, `open_coin`) registered read-only from a new `<WebMCPProvider />` mounted in the root layout — a no-op on browsers without WebMCP support. When an agent explicitly passes `network` (including `"mainnet"`), the tool forwards it to the router so it overrides any previously-selected network; omitting `network` preserves the user's current network. Each tool also returns the full effective URL (path + query string) alongside its `{ok: true}` result, so agents can surface the canonical link they just navigated to. The `aptos-explorer-urls` agent skill (`public/.well-known/agent-skills/aptos-explorer-urls/SKILL.md`) was extended to document the `/releases/{networks,aips,sdks}` hub and its legacy `/deployments` and `/aips` redirects.
- **Network deployments — feature flag comparison table**: a new "Feature Flags by Network" table on `/releases/networks` (legacy `/deployments` redirects there) shows every known `0x1::features::Features` flag side-by-side across mainnet, testnet, and devnet (with check/cross/spinner cells per network). The default view is "Differences" so flags that aren't in sync across environments are immediately visible, with chip filters to switch to "All", "Enabled (anywhere)", or "Disabled (everywhere)". Unknown flag IDs that are enabled on chain but not in our static name registry still surface as `Feature #N` rows so nothing is silently hidden. The static registry now mirrors every flag in `aptos-core`'s canonical `FeatureFlag` Rust enum (IDs 1..=111), including deprecated and "rolled-out" slots, so users see real names everywhere instead of `Feature #N` placeholders
- **Network deployments — node commit on each card**: each network card on `/releases/networks` (legacy `/deployments` redirects there) now shows the running node binary's git commit (7-char short hash linked to the `aptos-labs/aptos-core` GitHub commit) sourced from the fullnode index endpoint's `git_hash`. The per-card feature-flag accordion was removed in favor of the new comparison table above
- **Network deployments — node release version**: each network card on `/releases/networks` now resolves the running `git_hash` to a human-readable `aptos-node` release (e.g. `v1.43.2`) by parsing the commit message on GitHub for the `[aptos-release-vX.Y]` branch tag and the `Bump version to X.Y.Z` line. When the commit is on a release branch but is not itself a version-bump, the card shows `v1.43.x` so operators still see which minor train the binary belongs to. The label links to the matching `aptos-release-vX.Y` branch on GitHub
- **SDK & tool releases — stable release headline + drill-in**: each card on `/releases/sdks` (legacy `/releases` redirects to the default Networks tab) now shows the **latest stable** SemVer release (excluding `-rc`, `-alpha`, `-beta`, `-zeta`, etc.) as the headline number rather than whatever the registry tags as "latest"; cards expand to a "Recent releases" table listing up to 25 recent versions per registry with publish dates, working links, and a "Pre-release" badge on each non-stable entry. When a registry has no stable release in the recent window, the card surfaces the latest pre-release with a clear "No stable release found" hint instead of silently showing a pre-release
- **SDK & tool releases — publish dates for npm and PyPI**: the TypeScript SDK card on `/releases/sdks` now resolves publish timestamps via `time[version]` from the full npm registry document (instead of `/latest`, which omits them), and the Python SDK card now reads `releases[version][0].upload_time_iso_8601` from PyPI — previously both cards never showed a relative date, which made older releases look stale
- **Decibel bulk order detail**: the Decibel tab on transaction pages now displays full bid/ask price-size ladders parsed from `place_bulk_orders_to_subaccount` payload arguments, structured `BulkOrderPlacedEvent` data (including cancelled orders), and `BulkOrderFilledEvent` fill tables — previously only the market name and subaccount were shown for bulk orders
- **Labs verified token**: Decibel Dollar fungible asset (`usDCBL`, metadata object `0x9640…45b0` on mainnet) is included in the explorer manual verification list and coin metadata merge so it shows the Labs verified badge and correct branding where supported
- **Dev tooling**: Playwright (`@playwright/test`, `playwright.config.ts`, `test:e2e` / `test:e2e:install`); Vitest excludes `e2e/**` from unit runs; **CI** maps each `APTOS_<NETWORK>_API_KEY` repository secret to both `VITE_APTOS_<NETWORK>_API_KEY` and `APTOS_<NETWORK>_API_KEY` on the verify job so builds use one API key identity for client and SSR
- **CI**: Playwright smoke tests (home, network query param, Blocks nav) run after `pnpm ci:verify`
- **CI / e2e**: Playwright regression for **FEAT-TXN-003** — testnet transaction Balance Change tab loads indexer fungible-asset data (`e2e/transaction-balance-change.spec.ts`; outside CI, skips when the gateway returns 401 for the local preview origin so local `pnpm exec playwright test` is not flaky)
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

- **Blocks list** (`/blocks`): block REST fetches run with **bounded concurrency** instead of one simultaneous request per row, and React Query keys include the **saved API key identity** so a new Settings key does not reuse cached data from the old key. Default visible row count is **20** (was 30).
- **Transaction events tab** (`/txn/.../events`): Fee Statement and Decibel formatted event views stack labels above values on small screens (below the `md` breakpoint) instead of squeezing two table columns; nested price/size tables use the same stacked pattern; tables stay in horizontal scroll containers on wider layouts. Raw JSON (`JsonViewCard`) respects the content width on narrow viewports. The event **Type** row uses a fit-width title column so long Move type strings wrap more predictably. Shared implementation: `ResponsiveKeyValueTable` / `ResponsiveKeyValueRow` (`app/components/Table/ResponsiveKeyValueTable.tsx`) for reuse across the explorer.
- **Transaction overview** (`/txn/.../userTxnOverview`): the **Signature** block uses the same outlined table layout as the Fee Statement event view—labeled rows for scheme, public key, and signature (with expandable hex chips)—instead of only a collapsible JSON tree. Pending transactions use the same presentation. On small screens, label and value stack vertically; wide content can scroll horizontally so nothing is clipped.
- **Account modules (Packages / Code / Run / View)**: loading and empty states no longer flash “No Data” while package metadata is still fetching; addresses without `PackageRegistry` or on-chain modules get clearer guidance instead of a generic empty state or misleading “Account Not Found”; on modules URLs, a 404 from the account-resources fetch no longer shows the account-not-found banner; Run/View show **“No modules found”** when the modules API returns 404
- **Settings**: API Key Overrides section includes an info icon with a short explanation of why to use your own geomi.dev key (dedicated rate limits) and a link to geomi.dev
- Rate-limit drawer is now non-blocking (persistent banner instead of modal overlay) so users can still interact with the page, settings, and navigation while the notice is visible
- Saving an API key in Settings automatically dismisses the rate-limit drawer and suppresses re-triggering for 10 seconds, preventing stale in-flight 429 responses from immediately re-showing the drawer

### Changed

- **Light theme**: neutral grey app background (`#ECEEF2`), white cards/panels, cooler borders, and soft grey stripes for tables and filled inputs instead of warm cream-on-bright-off-white; primary body text uses ink (`#171612`) for slightly softer contrast than pure black. Light `theme-color` meta updated to match the canvas.

### Fixed

- **Transaction Balance Change tab**: the indexer GraphQL query now types `transaction_version` as `bigint` (matching the schema). The previous `String` variable caused Hasura validation errors, so fungible-asset activities never loaded and the tab appeared empty even when the indexer had data (for example gas fee rows on testnet).
- **AIPs page** (`/aips`): the table was empty because the GitHub tree filter regex (`/^aips\/aip-\d+\.md$/`) only matched the legacy filename shape; the `aptos-foundation/AIPs` repo standardized on `aips/aip-NNN-some-slug.md` (zero-padded number plus a kebab-case slug) some time ago, so no files matched. The filter now accepts both shapes and the canonical AIP number is taken from the file's `aip:` frontmatter (with the filename digits as a fallback) so zero-padded filenames don't change the rendered AIP number.
- **Wallet transactions on localnet**: non-Petra wallets that report a **custom** network name but use a **loopback** REST URL (for example `http://127.0.0.1:8080/v1`) are no longer blocked when the explorer is on the **local** network; submission still requires a real loopback endpoint match.
- **Blocks list** (`/blocks`): recent rows now use the same REST block API as block detail pages, so block hash, timestamps, and transaction version ranges match what you see after opening a block (previously the indexer `block_metadata_transactions` row was mislabeled as the block hash and version bounds could disagree with the node).
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
