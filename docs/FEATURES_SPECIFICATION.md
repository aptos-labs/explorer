# Aptos Explorer — Features Specification

> **Purpose**: Canonical catalog of every user-facing feature in the explorer.
> Each section maps directly to a testable behavior. When adding or changing
> a feature, update this file in the same PR so the spec stays in sync with the
> code. Tests (unit, integration, E2E) should reference the feature IDs defined
> here (e.g. `// Covers FEAT-SEARCH-001`).
>
> **Last updated**: 2026-03-23

---

## Table of Contents

1. [Global Chrome](#1-global-chrome)
2. [Home / Search](#2-home--search)
3. [Transactions List](#3-transactions-list)
4. [Transaction Detail](#4-transaction-detail)
5. [Blocks List](#5-blocks-list)
6. [Block Detail](#6-block-detail)
7. [Account / Object Detail](#7-account--object-detail)
8. [Modules Sub-Route](#8-modules-sub-route)
9. [Validators List](#9-validators-list)
10. [Validator Detail (Delegatory)](#10-validator-detail-delegatory)
11. [Coins / Fungible Assets List](#11-coins--fungible-assets-list)
12. [Coin Detail](#12-coin-detail)
13. [Fungible Asset Detail](#13-fungible-asset-detail)
14. [Token / NFT Detail](#14-token--nft-detail)
15. [Analytics](#15-analytics)
16. [Verification](#16-verification)
17. [Wallet Integration](#17-wallet-integration)
18. [Settings](#18-settings)
19. [Theme / Color Mode](#19-theme--color-mode)
20. [Network Selection](#20-network-selection)
21. [Routing & Navigation](#21-routing--navigation)
22. [Error Handling](#22-error-handling)
23. [SEO / LLM Accessibility](#23-seo--llm-accessibility)
24. [Feature Flags & Conditional Behavior](#24-feature-flags--conditional-behavior)

---

## 1. Global Chrome

The app shell that wraps every page.

### FEAT-CHROME-001 — Header

| Aspect | Detail |
|--------|--------|
| **Logo** | Aptos logo links to `/`, scrolls to top. |
| **Desktop Nav** | Links: Transactions, Analytics (mainnet only), Validators, Blocks, Coins. Active link highlighted via `useLocation`. |
| **Mobile Nav** | Hamburger opens `NavMobile` drawer with same links, plus Settings and Wallet. |
| **Search** | Header autocomplete search (see FEAT-SEARCH). |
| **Network selector** | Dropdown to switch `?network=` param (see FEAT-NETWORK). |
| **Theme toggle** | Light/dark icon button (see FEAT-THEME). |
| **Settings** | Gear icon opens `SettingsDialog` (see FEAT-SETTINGS). |
| **Wallet connector** | Connect/disconnect wallet button (see FEAT-WALLET). |
| **Feature bar** | Colored banner when running on a non-production feature branch. |

### FEAT-CHROME-002 — Footer

| Aspect | Detail |
|--------|--------|
| **Links** | Privacy, Terms, Verification page. |
| **Social** | GitHub, Discord, X, Medium, LinkedIn — all `rel="noopener noreferrer"`. |
| **Clear Cache** | Button clears search cache in localStorage. |
| **Copyright** | Aptos Labs attribution. |

### FEAT-CHROME-003 — Navigation Pending State

| Aspect | Detail |
|--------|--------|
| **Behavior** | Global `defaultPendingComponent` shows a loading indicator during route transitions with minimum display time to reduce flicker. |

---

## 2. Home / Search

**Route**: `/`
**Route (dedicated)**: `/search?q=...`

### FEAT-SEARCH-001 — Search Input

| Aspect | Detail |
|--------|--------|
| **Header autocomplete** | MUI `Autocomplete` with 500ms debounce, abort on new input, localStorage result cache (1h for tx/block-only results, 5min otherwise). |
| **Full-page search** | 400ms debounce, `?search=` param on `/`, `?q=` on `/search`. Enter navigates to first result. |
| **Single-result auto-navigate** | If URL provides `?search=` and exactly one navigable result, navigate immediately. |

### FEAT-SEARCH-002 — Search Types

| Input Pattern | Search Behavior |
|---------------|-----------------|
| `.apt` / `.petra` suffix | ANS name lookup → account link |
| Valid Move struct | Coin lookup via `CoinInfo` resource + Panora coin list |
| Numeric | Parallel: block by height, transaction by version, block by version |
| 32-byte hex | Parallel: transaction hash, account address, coin list |
| Valid account address | Account, FA metadata, object core, resources, coin list |
| Emoji-only | Emojicoin market lookup |
| Generic text (length > 2) | Coin list + known address label match |

### FEAT-SEARCH-003 — Search Results

| Aspect | Detail |
|--------|--------|
| **Result types** | Account, Address, Transaction, Block, Coin, Fungible Asset, Object. |
| **Grouping** | Results grouped by type with section headers. |
| **Deduplication** | Prefer coin list coin over struct coin; drop redundant "Address" when Account/FA/Object exists. |
| **Avatars** | Token logos, known-address brand marks, blockies fallback. |
| **Fallback** | Valid-looking address with no on-chain hits → still link to `/account/...`. |

### FEAT-SEARCH-004 — Home Page (non-search state)

| Aspect | Detail |
|--------|--------|
| **Widgets** | Total transactions count, CTAs to transactions/blocks/analytics. |

---

## 3. Transactions List

**Route**: `/transactions`

### FEAT-TXLIST-001 — User vs All Toggle

| Aspect | Detail |
|--------|--------|
| **Parameter** | `?type=user` (default) or `?type=all`. |
| **User transactions** | Shows only user-submitted transactions, server-side pagination. |
| **All transactions** | Shows all transaction types, different pagination. |

### FEAT-TXLIST-002 — Function Filter

| Aspect | Detail |
|--------|--------|
| **Parameter** | `?fn=` — filter by entry function ID (e.g. `0x1::coin::transfer`). |
| **Server-side** | Applied on User Transactions and Account Transactions views. |
| **Client-side** | Applied on All Transactions view. |

### FEAT-TXLIST-003 — Table Columns

| Aspect | Detail |
|--------|--------|
| **Columns** | Version, type, timestamp, sender, function, gas. |
| **Pagination** | Cursor-based pagination with start param. |

---

## 4. Transaction Detail

**Route**: `/txn/$txnHashOrVersion/$tab`

### FEAT-TXN-001 — Tab Selection by Type

| Transaction Type | Available Tabs |
|------------------|----------------|
| User | Overview, Balance Change, Events, Payload, Changes |
| Block metadata | Overview, Events, Changes |
| State checkpoint | Overview |
| Pending | Overview, Payload |
| Genesis | Overview, Events, Payload, Changes |
| Validator | Overview, Events, Changes |
| Block epilogue | Overview, Events, Changes |
| Unknown | Overview, Events, Changes |

### FEAT-TXN-002 — User Transaction Overview

| Aspect | Detail |
|--------|--------|
| **Key fields** | Version, status, sender, fee payer, secondary signers, function, arguments, amount. |
| **Transfer/interaction** | Rich parsing of DEX swaps, LSD operations, Econia-style events. |
| **Gas** | Gas fee, storage refund, net gas, gas unit price, max gas, VM status. |
| **AIP-141 banner** | Gas impact warning when AIP-141 is enabled. |
| **Block** | Link to parent block. |
| **Timestamps** | Expiration and execution timestamp. |
| **Signature** | JSON display of signature data. |
| **Hashes** | State, event, and accumulator root hashes. |

### FEAT-TXN-003 — Balance Change Tab

| Aspect | Detail |
|--------|--------|
| **Data source** | Indexer fungible asset activities when available, fallback to raw event parsing. |
| **Views** | Aggregated and non-aggregated balance changes. |
| **Verification filter** | Mainnet: Verified / Recognized / All asset filter. |
| **Table** | Address, asset, amount, type columns. |

### FEAT-TXN-004 — Events Tab

| Aspect | Detail |
|--------|--------|
| **Display** | Collapsible list per event, JSON view. |
| **FeeStatement** | Special `FeeStatementEventView` for `0x1::transaction_fee::FeeStatement`. |
| **Module events** | Hide zero GUID fields. |

### FEAT-TXN-005 — Payload Tab

| Aspect | Detail |
|--------|--------|
| **Display** | Collapsible payload with JSON view. |
| **Script decompile** | For `script_payload`, embeds `ScriptBytecodeDecompiler`. |

### FEAT-TXN-006 — Changes Tab

| Aspect | Detail |
|--------|--------|
| **Display** | Write-set changes with table-item enrichment (handle → enclosing account). |
| **Awareness** | Object/collection/token aware display. |

### FEAT-TXN-007 — Debug Section

| Aspect | Detail |
|--------|--------|
| **Display** | Accordion at bottom with raw JSON and fullnode API link. |

### FEAT-TXN-008 — Default Tab Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | `/txn/$hash` → `/txn/$hash/userTxnOverview`; client-side correction for non-user transactions. |
| **Invalid tab** | Redirects to the first tab for the transaction type. |

---

## 5. Blocks List

**Route**: `/blocks`

### FEAT-BLOCKS-001 — Recent Blocks Table

| Aspect | Detail |
|--------|--------|
| **Data** | Ledger info + indexer `block_metadata_transactions`. |
| **Pagination** | `?start=` cursor. |
| **Columns** | Block height (linked), proposer, timestamp, transaction count. |

---

## 6. Block Detail

**Route**: `/block/$height/$tab`

### FEAT-BLOCK-001 — Tabs

| Tab | Content |
|-----|---------|
| `overview` | Block height, proposer, epoch, round, timestamp, hash, first/last version. |
| `transactions` | List of transactions in the block. |

### FEAT-BLOCK-002 — Default Tab Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | `/block/$height` → `/block/$height/overview`. |

---

## 7. Account / Object Detail

**Route (account)**: `/account/$address/$tab`
**Route (object)**: `/object/$address/$tab`

### FEAT-ACCOUNT-001 — ANS Name Resolution

| Aspect | Detail |
|--------|--------|
| **Behavior** | `.apt` names resolved to addresses via `useGetANS`. Primary name shown in title when available. |

### FEAT-ACCOUNT-002 — Balance Card

| Aspect | Detail |
|--------|--------|
| **APT balance** | Formatted APT balance via `useGetAccountAPTBalance`. |
| **USD estimate** | On mainnet, fetches CoinGecko price and shows fiat estimate. |
| **DeFi links** | Dropdown: Lightscan, Yield AI portfolio links. |

### FEAT-ACCOUNT-003 — Banners

| Banner | Condition | Content |
|--------|-----------|---------|
| Known address branding | `useKnownAddressBranding` match | Logo, optional badge overlay, description. |
| Defunct protocol | Mainnet, `getDefunctProtocol` match | Warning + optional Withdraw Funds dialog. |
| Aptos Names promo | `useGetInDevMode` true | ANS claim CTA. |
| Petra Vault (multisig) | Account is multisig | "MULTISIG" pill + Petra Vault link. |

### FEAT-ACCOUNT-004 — Object Detection & Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | If address at `/account/...` is a pure object → redirect to `/object/...`. |

### FEAT-ACCOUNT-005 — Tab Set (Account)

| Condition | Tabs |
|-----------|------|
| GraphQL on | transactions, coins (Assets), tokens (NFTs), resources, modules, info, gas-impact (if AIP-141 enabled) |
| GraphQL off | transactions, resources, modules, info, gas-impact (if AIP-141 enabled) |
| Multisig + GraphQL | transactions, multisig, coins, tokens, resources, modules, info, gas-impact |
| Object + GraphQL | transactions, coins, tokens, resources, modules, info |
| Object − GraphQL | transactions, resources, modules, info |

### FEAT-ACCOUNT-006 — Transactions Tab

| Aspect | Detail |
|--------|--------|
| **Modes** | Sender-only (REST) vs all involvement (GraphQL) with toggle. |
| **AIP-141 toggle** | Optional gas impact column on transactions table. |
| **Function filter** | `?fn=` filter support. |
| **Pagination** | Cursor-based. |

### FEAT-ACCOUNT-007 — Assets (Coins) Tab

| Aspect | Detail |
|--------|--------|
| **Data** | `useGetAllAccountCoins` merged with Panora/coin list. |
| **Table** | Asset name, symbol, balance, type. |

### FEAT-ACCOUNT-008 — NFTs (Tokens) Tab

| Aspect | Detail |
|--------|--------|
| **Data** | `useGetAccountTokens` with count. |
| **Table** | Token name, collection, property version, amount. |
| **Scam detection** | Collections in `labsBannedCollections` → "Dangerous" icon + tooltip. |
| **Pagination** | `?page=` param, 20 per page. |

### FEAT-ACCOUNT-009 — Resources Tab

| Aspect | Detail |
|--------|--------|
| **Display** | Collapsible cards per Move resource type with JSON viewer. |

### FEAT-ACCOUNT-010 — Info Tab

| Aspect | Detail |
|--------|--------|
| **Account info** | Sequence number, auth key (rotation hint). |
| **Object info** | Owner, transferability. |
| **Object refs** | Transfer/delete/extend ref chips via `useGetObjectRefs`. |

### FEAT-ACCOUNT-011 — Gas Impact Tab

| Aspect | Detail |
|--------|--------|
| **Condition** | `AIP141_CONFIG.enabled` and not an object. |
| **Table** | Version, function, gas used, projected (10x), max gas limit, status (would exceed?). |
| **Context** | Uses `useGetGasScheduleVersion` and `isAip141Executed` for alert text. |

### FEAT-ACCOUNT-012 — Multisig Tab

| Aspect | Detail |
|--------|--------|
| **Data** | `0x1::multisig_account::MultisigAccount` resource. |
| **Display** | Required signatures, next sequence, owners, pending transactions, event counters, raw JSON. |

### FEAT-ACCOUNT-013 — Default Tab Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | `/account/$address` → `/account/$address/transactions`. |
| **Legacy params** | `?tab=` → `/$tab`; `?modulesTab=`, `?selectedModuleName=`, `?selectedFnName=` → path-based modules routes. |

---

## 8. Modules Sub-Route

**Route**: `/account/$address/modules/$splat` (also `/object/$address/modules/$splat`)

### FEAT-MODULES-001 — Sub-Tabs

| Sub-tab | URL segment | Content |
|---------|-------------|---------|
| Packages | `packages` | Package sidebar, `MovePackageManifest`, version-aware via ledger version. |
| Code | `code` | Module selector, `ModuleHeader` (entry fn count, bytecode size), source vs decompiled Move vs disassembly. |
| Run | `run` | Wallet-connected entry function execution forms (type args, args, ANS address resolution, `useSubmitTransaction`). Disabled for historical versions. |
| View | `view` | View function calls via `view` API with result display/copy. Disabled for historical versions. |

### FEAT-MODULES-002 — Module Version Selector

| Aspect | Detail |
|--------|--------|
| **Behavior** | Historical ledger version selector. When viewing a historical version, Run and View tabs are disabled with tooltip. |

### FEAT-MODULES-003 — Module Diff View

| Aspect | Detail |
|--------|--------|
| **Condition** | Publish history has ≥ 2 versions. |
| **Display** | Side-by-side diff of module source between versions. |

### FEAT-MODULES-004 — Move Decompiler

| Aspect | Detail |
|--------|--------|
| **Technology** | Lazy-loaded WASM Move decompiler. |
| **Caching** | Decompilation results cached. |
| **Views** | Published source, decompiled Move, bytecode disassembly. |

### FEAT-MODULES-005 — Default Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | `/account/$address/modules` → `/account/$address/modules/packages`. |

---

## 9. Validators List

**Route**: `/validators/$tab`

### FEAT-VALIDATORS-001 — Tabs

| Tab | URL | Content |
|-----|-----|---------|
| All Nodes | `/validators/all` | `ValidatorsTable` with all active validators. |
| Delegation Nodes | `/validators/delegation` | `EnhancedDelegationValidatorsTable`. |
| Delegation (Beta) | `/validators/enhanced_delegation` | Same enhanced delegation table. |

### FEAT-VALIDATORS-002 — All Nodes Table

| Aspect | Detail |
|--------|--------|
| **Columns** | Staking pool address, operator address, voting power (sortable), rewards performance %, last epoch performance, location (city, country). |
| **Sorting** | Filters zero voting power by default. |
| **Mobile** | Card layout. |

### FEAT-VALIDATORS-003 — Delegation Table

| Aspect | Detail |
|--------|--------|
| **Columns** | Status, commission, delegator count, rewards earned, delegated amount. |
| **Wallet-aware** | "My deposit" column when wallet connected. |

### FEAT-VALIDATORS-004 — Validators Map

| Aspect | Detail |
|--------|--------|
| **Condition** | Mainnet only. |
| **Technology** | `react-simple-maps` (`ComposableMap`). |
| **Toggle** | By City / By Country grouping. |
| **Markers** | Circle size scales with node count; country mode shows city breakdown in tooltip. |
| **Metrics** | `MapMetrics` beside/below map (epoch, validator count, etc.). |

### FEAT-VALIDATORS-005 — Out-of-Commission Banner

| Aspect | Detail |
|--------|--------|
| **Display** | `OutOfCommissionPoolsBanner` at top of validators page. |

### FEAT-VALIDATORS-006 — Default Tab Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | `/validators` → `/validators/all`. `/validators-enhanced` → `/validators/all`. `/validators-enhanced/$tab` → `/validators/$tab`. |

---

## 10. Validator Detail (Delegatory)

**Route**: `/validator/$address`

### FEAT-VALDEL-001 — Validator Info

| Aspect | Detail |
|--------|--------|
| **Data** | `0x1::stake::StakePool` resource + `useGetValidators` + delegation pool list. |
| **Display** | `ValidatorTitle`, `ValidatorDetailCard` (operator, performance, delegation state, time bars). |

### FEAT-VALDEL-002 — Commission Change Banner

| Aspect | Detail |
|--------|--------|
| **Condition** | Pending commission change. |
| **Display** | Banner with commission change details. |

### FEAT-VALDEL-003 — Staking Bar & Operations

| Aspect | Detail |
|--------|--------|
| **Display** | `ValidatorStakingBar` with metrics + "Stake" CTA. |
| **Operations** | `add_stake`, `unlock`, `reactivate_stake`, `withdraw` via `0x1::delegation_pool`. |
| **Dialog** | `StakeOperationDialog` with amount validation, wallet integration. |

### FEAT-VALDEL-004 — My Deposits

| Aspect | Detail |
|--------|--------|
| **Condition** | Wallet connected. |
| **Display** | `MyDepositsSection` showing user's staked amounts and available operations. |

---

## 11. Coins / Fungible Assets List

**Route**: `/coins`

### FEAT-COINS-001 — Asset Directory

| Aspect | Detail |
|--------|--------|
| **Display** | Sortable table of coins and fungible assets. |
| **States** | Loading, error, and empty states handled. |

---

## 12. Coin Detail

**Route**: `/coin/$struct/$tab`

### FEAT-COIN-001 — Tabs

| Condition | Tabs |
|-----------|------|
| GraphQL on | info, holders, transactions |
| GraphQL off | info |

### FEAT-COIN-002 — Coin Info

| Aspect | Detail |
|--------|--------|
| **Data** | `CoinInfo` resource, supply limit, paired FA. |
| **Display** | Coin name, symbol, decimals, supply, paired fungible asset link. |

### FEAT-COIN-003 — Verification Banner

| Aspect | Detail |
|--------|--------|
| **Display** | Banner indicating verification status (verified, recognized, unverified). |

### FEAT-COIN-004 — Holders Tab

| Aspect | Detail |
|--------|--------|
| **Data** | Top holders via indexer. |
| **Table** | Address, balance, percentage columns. |

### FEAT-COIN-005 — Transactions Tab

| Aspect | Detail |
|--------|--------|
| **Data** | Coin activity history. |

### FEAT-COIN-006 — Default Tab Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | `/coin/$struct` → `/coin/$struct/info`. |

---

## 13. Fungible Asset Detail

**Route**: `/fungible_asset/$address/$tab`

### FEAT-FA-001 — Tabs

| Condition | Tabs |
|-----------|------|
| GraphQL on | info, holders, transactions |
| GraphQL off | info |

### FEAT-FA-002 — Asset Info

| Aspect | Detail |
|--------|--------|
| **Data** | FA metadata, supply, paired coin. |
| **Display** | Name, symbol, decimals, supply, icon, paired coin link, FA properties (mint/burn/transfer flags). |

### FEAT-FA-003 — Verification Banner

| Aspect | Detail |
|--------|--------|
| **Display** | Same verification banner as Coin pages. |

### FEAT-FA-004 — Default Tab Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | `/fungible_asset/$address` → `/fungible_asset/$address/info`. |

---

## 14. Token / NFT Detail

**Route**: `/token/$tokenId/$tab`

### FEAT-TOKEN-001 — Tabs

| Tab | Content |
|-----|---------|
| `overview` | Name, owners, collection, creator, metadata URI, image preview, properties, supply. |
| `activities` | Transaction history for the token. |

### FEAT-TOKEN-002 — Overview

| Aspect | Detail |
|--------|--------|
| **Metadata** | Name, collection name, creator address, collection ID, token ID. |
| **Image** | Fetches metadata JSON to resolve image URL (including `ipfs://` support). |
| **Properties** | `token_properties` JSON display. |
| **Stats** | Largest property version (v1), supply, max supply, last transaction. |
| **Token standard** | v1 vs v2 differences in displayed fields. |

### FEAT-TOKEN-003 — Activities Tab

| Aspect | Detail |
|--------|--------|
| **Columns** | Transaction version (linked), type, from, to, property version, amount. |
| **Pagination** | `?page=`, 20 per page. |

### FEAT-TOKEN-004 — Legacy URL Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | Numeric `$tab` → treated as old property-version URL → redirect to `overview` with `propertyVersion` in search. |

### FEAT-TOKEN-005 — Default Tab Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | `/token/$tokenId` → `/token/$tokenId/overview`. Preserves `propertyVersion` search param. |

---

## 15. Analytics

**Route**: `/analytics`

### FEAT-ANALYTICS-001 — Mainnet Gate

| Aspect | Detail |
|--------|--------|
| **Behavior** | Analytics page only renders charts on mainnet. Other networks show "Analytics are available for Mainnet only." |

### FEAT-ANALYTICS-002 — Charts

| Chart | Data Field |
|-------|------------|
| Daily User Transactions | `daily_user_transactions` |
| Daily Peak TPS | `daily_max_tps_15_blocks` |
| Monthly Active Users | `mau_signers` |
| Daily Active Users | `daily_active_users` |
| Daily New Accounts | `daily_new_accounts_created` |
| Daily Deployed Contracts | `daily_deployed_contracts` |
| Daily Contract Deployers | `daily_contract_deployers` |
| Daily Gas Consumption | `daily_gas_from_user_transactions` |
| Daily Avg Gas Unit Price | `daily_average_gas_unit_price` |
| Daily Block Gap | `daily_block_gap` |

### FEAT-ANALYTICS-003 — Date Range

| Aspect | Detail |
|--------|--------|
| **Options** | 7 days, 30 days via `ChartRangeDaysSelect`. |

### FEAT-ANALYTICS-004 — Network Info Strip

| Metric | Source |
|--------|--------|
| Total Supply | `useGetCoinSupplyLimit` |
| Total Stake | On-chain |
| TPS (current + peak 30d) | `useGetTPS` / `useGetPeakTPS` |
| Active Nodes | Live chain hook |

### FEAT-ANALYTICS-005 — Data Source

| Aspect | Detail |
|--------|--------|
| **URL** | GCS `chain_stats_v2.json` with cache busting. |
| **Caching** | React Query: stale 10min, GC 1h, 1 retry. |

---

## 16. Verification

**Route**: `/verification`

### FEAT-VERIFY-001 — Static Content

| Aspect | Detail |
|--------|--------|
| **Display** | Article-style instructions for Panora and Labs verification. No interactive chain queries. |

---

## 17. Wallet Integration

### FEAT-WALLET-001 — Connect / Disconnect

| Aspect | Detail |
|--------|--------|
| **Package** | `@aptos-labs/wallet-adapter-react`. |
| **UI** | `WalletConnector` → `WalletButton` → `WalletModel` / `WalletMenu`. |
| **Auto-connect** | Enabled. |
| **Network sync** | Wallet network synced to `useNetworkName()`. |
| **Aptos Connect** | Supports Aptos Connect dApp ID. |

### FEAT-WALLET-002 — Transaction Submission

| Aspect | Detail |
|--------|--------|
| **Hook** | `useSubmitTransaction`. |
| **Validation** | Enforces wallet network matches explorer network (exception for Google Aptos Connect). |
| **Flow** | Signs via wallet adapter, confirms via explorer's Aptos client. |

### FEAT-WALLET-003 — Account Navigation

| Aspect | Detail |
|--------|--------|
| **Behavior** | On connect, navigates to connected account page. |

---

## 18. Settings

### FEAT-SETTINGS-001 — Settings Dialog

| Aspect | Detail |
|--------|--------|
| **API key override** | Masked input for geomi.dev API key. |
| **Persistence** | "Remember on this device" → localStorage, cross-tab sync via `storage` events. |
| **On save** | Clears cached clients, invalidates all React Query queries, invalidates router. |

---

## 19. Theme / Color Mode

### FEAT-THEME-001 — Light / Dark Mode

| Aspect | Detail |
|--------|--------|
| **Toggle** | Icon button in header. |
| **Persistence** | Cookie + system preference detection (`COLOR_MODE_COOKIE`). |
| **Implementation** | MUI `ThemeProvider` via `ProvideColorMode`. |
| **WCAG** | Semantic colors tuned for WCAG 2.1 AA contrast (regression tested). |

---

## 20. Network Selection

### FEAT-NETWORK-001 — Network Selector

| Aspect | Detail |
|--------|--------|
| **Param** | `?network=` in URL. |
| **Behavior** | Navigate to same path with new network param, `replace: true`. |
| **Options** | Visible networks + localnet (`local`); some networks hidden (`hiddenNetworks`). |
| **Persistence** | Cookie fallback when no URL param. |
| **Sync** | All data hooks read network from URL/global config. Client cache is per-network. |

### FEAT-NETWORK-002 — Network Preserved on Navigation

| Aspect | Detail |
|--------|--------|
| **Behavior** | Custom `Link` and `useNavigate` from `app/routing.tsx` merge current `network` into `search` on every navigation. |

---

## 21. Routing & Navigation

### FEAT-ROUTING-001 — File-Based Routes

| Aspect | Detail |
|--------|--------|
| **System** | TanStack Router file-based routing. Dot segments = path segments. |
| **Generated tree** | `app/routeTree.gen.ts` — never edit by hand. |
| **Regeneration** | `pnpm routes:generate` (auto via pre-scripts). |

### FEAT-ROUTING-002 — Legacy URL Redirects

| Aspect | Detail |
|--------|--------|
| **Hash-based tabs** | `useHashToPathRedirect` in root layout. |
| **Old hostnames** | `useOldUrlRedirect` in root layout. |
| **Query param tabs** | `?tab=` → `/$tab` in account/object/coin/FA/block/txn routes. |
| **Validators-enhanced** | `/validators-enhanced` → `/validators/all`; `/validators-enhanced/$tab` → `/validators/$tab`. |

### FEAT-ROUTING-003 — Entity Path Helpers

| Aspect | Detail |
|--------|--------|
| **Functions** | `buildPath` / `parsePath` for `account`, `txn`, `block`, etc. entity prefixes. |

### FEAT-ROUTING-004 — Scroll Restoration

| Aspect | Detail |
|--------|--------|
| **Behavior** | Router-level scroll restoration on navigation. |

### FEAT-ROUTING-005 — Preloading

| Aspect | Detail |
|--------|--------|
| **Behavior** | `preloadOnFocus` enabled: routes preloaded on hover/focus intent. |
| **Data** | Loaders use `ensureQueryData` / prefetch in route `loader` functions. |

---

## 22. Error Handling

### FEAT-ERROR-001 — Error Boundary

| Aspect | Detail |
|--------|--------|
| **Chunk errors** | "Update Available" card with Refresh + native home link (avoids router). |
| **General errors** | "Something went wrong" + error message, dev-only stack, Try Again, Go Home. |

### FEAT-ERROR-002 — Not Found

| Aspect | Detail |
|--------|--------|
| **Display** | 404 page with Go Home link. |

### FEAT-ERROR-003 — Rate Limiting

| Aspect | Detail |
|--------|--------|
| **Detection** | HTTP 429 → `ResponseErrorType.TOO_MANY_REQUESTS`. |
| **Client throttle** | Token-bucket per-endpoint queue with retry + exponential backoff. |
| **Per-feature** | Account transactions (GraphQL retry + user message), CoinGecko (batching + delays). No single global toast. |

### FEAT-ERROR-004 — Suspense Fallback

| Aspect | Detail |
|--------|--------|
| **Behavior** | Root wraps `<Outlet />` in `<Suspense fallback={<Fallback />}>`. |

---

## 23. SEO / LLM Accessibility

### FEAT-SEO-001 — Page Metadata

| Aspect | Detail |
|--------|--------|
| **Hook** | `usePageMetadata` sets title, description, canonical URL, JSON-LD structured data per page type. |
| **JSON-LD types** | `WebSite` (home), `Article`, `WebPage`, `CollectionPage`, entity-specific schemas. |
| **Search action** | `/?search={search_term_string}`. |

### FEAT-SEO-002 — LLM Documentation

| File | Purpose |
|------|---------|
| `public/llms.txt` | Short LLM reference (llmstxt.org standard). |
| `public/llms-full.txt` | Full reference with API docs and examples. |
| `public/robots.txt` | Bot crawl rules including AI crawlers. |
| `public/sitemap.xml` | Static URL list for crawlers. |

### FEAT-SEO-003 — Drift Tests

| Aspect | Detail |
|--------|--------|
| **Test** | `app/utils/llmsRouteCoverage.test.ts` ensures `llms.txt` / `llms-full.txt` cover all core path snippets. |

---

## 24. Feature Flags & Conditional Behavior

### FEAT-FLAGS-001 — AIP-141 Gas Impact

| Aspect | Detail |
|--------|--------|
| **Config** | `AIP141_CONFIG` in `app/utils/aip140.ts`. |
| **Controls** | `enabled`, `gasMultiplier`, version cutoffs, `aip141GasScheduleVersion`. |
| **Affects** | Gas Impact tab on accounts, AIP-141 banner on transactions, gas-impact toggle on tx tables. |

### FEAT-FLAGS-002 — GraphQL / Indexer Support

| Aspect | Detail |
|--------|--------|
| **Check** | `useGetIsGraphqlClientSupported` — true when indexer URL configured for network. |
| **Affects** | Coin/FA holders+transactions tabs, account coins+tokens tabs, account all-transactions mode, balance changes, table items, search enrichment. |

### FEAT-FLAGS-003 — Mainnet-Only Features

| Feature | Detail |
|---------|--------|
| Analytics page | Charts only render on mainnet. |
| Validators map | Only on mainnet. |
| APT/USD price | CoinGecko only on mainnet. |
| Peak TPS | Only on mainnet. |
| Analytics data | GCS JSON only fetched on mainnet. |
| Defunct protocol banners | Only on mainnet. |

### FEAT-FLAGS-004 — Dev Mode

| Aspect | Detail |
|--------|--------|
| **Check** | `useGetInDevMode` / `useFeatureName()`. |
| **Current state** | Always returns `"prod"` — dev mode features are inactive. |
| **Affects** | Aptos Names promo banner (only shown in dev mode). |

### FEAT-FLAGS-005 — Netlify Preview

| Aspect | Detail |
|--------|--------|
| **Check** | `isNetlifyPreview`. |
| **Affects** | Suppresses VITE_* API keys on preview/branch deploy builds. |

---

## Appendix A: URL Pattern Reference

| URL Pattern | Feature ID |
|-------------|------------|
| `/` | FEAT-SEARCH-004 |
| `/search?q=...` | FEAT-SEARCH-001 |
| `/transactions` | FEAT-TXLIST-001 |
| `/blocks` | FEAT-BLOCKS-001 |
| `/coins` | FEAT-COINS-001 |
| `/analytics` | FEAT-ANALYTICS-001 |
| `/verification` | FEAT-VERIFY-001 |
| `/validators/$tab` | FEAT-VALIDATORS-001 |
| `/account/$address/$tab` | FEAT-ACCOUNT-005 |
| `/object/$address/$tab` | FEAT-ACCOUNT-005 |
| `/account/$address/modules/$splat` | FEAT-MODULES-001 |
| `/object/$address/modules/$splat` | FEAT-MODULES-001 |
| `/txn/$txnHashOrVersion/$tab` | FEAT-TXN-001 |
| `/block/$height/$tab` | FEAT-BLOCK-001 |
| `/coin/$struct/$tab` | FEAT-COIN-001 |
| `/fungible_asset/$address/$tab` | FEAT-FA-001 |
| `/token/$tokenId/$tab` | FEAT-TOKEN-001 |
| `/validator/$address` | FEAT-VALDEL-001 |

## Appendix B: Existing Test Coverage

| Test File | Covers |
|-----------|--------|
| `app/utils/utils.test.ts` | Address utilities, formatting, validation, timestamps |
| `app/utils/aip140.test.ts` | FEAT-FLAGS-001 (AIP-141 helpers) |
| `app/utils/cliCommand.test.ts` | CLI command generation from payloads |
| `app/utils/moveDecompiler.test.ts` | FEAT-MODULES-004 (decompiler helpers) |
| `app/utils/moduleErrorHandler.test.ts` | FEAT-ERROR-001 (chunk error handling) |
| `app/utils/llmsRouteCoverage.test.ts` | FEAT-SEO-003 (LLM doc drift) |
| `app/data/knownAddressBranding.test.ts` | FEAT-ACCOUNT-003 (known address branding) |
| `app/data/defunctProtocols.test.ts` | FEAT-ACCOUNT-003 (defunct protocol registry) |
| `app/types/defunctProtocol.test.ts` | Defunct protocol validation |
| `app/settings/clientSettings.test.ts` | FEAT-SETTINGS-001 (settings persistence) |
| `app/themes/colors/aptosBrandColors.a11y.test.ts` | FEAT-THEME-001 (WCAG contrast) |
| `app/components/hooks/usePageMetadata.structuredData.test.ts` | FEAT-SEO-001 (JSON-LD generation) |
| `app/components/IndividualPageContent/ContentValue/CurrencyValue.test.tsx` | Currency formatting |
| `app/pages/Transaction/utils.test.ts` | FEAT-TXN-002/003 (tx amounts, counterparty, balance changes) |
| `app/pages/Transaction/Tabs/Components/moveParamTypeDisplay.test.ts` | Move type display badges |
| `app/pages/Account/Tabs/ModulesTab/Contract.test.ts` | FEAT-MODULES-001 (contract result utilities) |
| `app/pages/layout/Search/searchUtils.test.ts` | FEAT-SEARCH-003 (fallback address results) |
| `app/api/hooks/useGetObjectRefs.test.ts` | FEAT-ACCOUNT-010 (object ref detection) |
| `app/api/hooks/useGetFaProperties.test.ts` | FEAT-FA-002 (FA property derivation) |

## Appendix C: Test Coverage Gaps

The following features lack automated test coverage and should be prioritized:

### High Priority (Core User Flows)

| Feature ID | Feature | Suggested Test Type |
|------------|---------|---------------------|
| FEAT-SEARCH-002 | Search type detection & routing | Unit: `detectInputType()` comprehensive tests |
| FEAT-SEARCH-003 | Search result grouping & dedup | Unit: `groupSearchResults`, `filterSearchResults` |
| FEAT-TXLIST-001 | User vs All toggle | Integration: component renders correct mode |
| FEAT-ACCOUNT-005 | Tab set computation | Unit: `useAccountTabValues` with all flag combos |
| FEAT-ACCOUNT-013 | Default tab redirects | Unit: `beforeLoad` redirect logic |
| FEAT-TXN-001 | Tab selection by type | Unit: `getTabValues` for each transaction type |
| FEAT-ROUTING-002 | Legacy URL redirects | Integration: old URLs → new paths |

### Medium Priority (Important Features)

| Feature ID | Feature | Suggested Test Type |
|------------|---------|---------------------|
| FEAT-NETWORK-001 | Network switching | Integration: URL param + data refetch |
| FEAT-NETWORK-002 | Network preserved on nav | Unit: custom `Link` merges `network` |
| FEAT-VALIDATORS-001 | Validator tab set | Unit/integration |
| FEAT-BLOCK-001 | Block detail tabs | Integration |
| FEAT-COIN-001 | Coin tab gating | Unit: GraphQL on/off |
| FEAT-FA-001 | FA tab gating | Unit: GraphQL on/off |
| FEAT-TOKEN-004 | Legacy token URL redirect | Unit: numeric tab → overview |
| FEAT-WALLET-002 | Tx submission network check | Unit: wallet/explorer network mismatch |

### Lower Priority (Edge Cases & Polish)

| Feature ID | Feature | Suggested Test Type |
|------------|---------|---------------------|
| FEAT-ACCOUNT-004 | Object detection redirect | Integration |
| FEAT-ACCOUNT-008 | Scam collection detection | Unit: `labsBannedCollections` check |
| FEAT-ERROR-003 | Rate limit handling | Unit: token bucket, retry logic |
| FEAT-ANALYTICS-001 | Mainnet gate | Unit: non-mainnet shows message |
| FEAT-FLAGS-002 | GraphQL support check | Unit: with/without indexer URL |
| FEAT-CHROME-002 | Footer cache clear | Integration |
| FEAT-VALIDATORS-004 | Map data grouping | Unit: geo data → city/country groups |
