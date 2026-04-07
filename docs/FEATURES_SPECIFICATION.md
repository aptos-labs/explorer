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
23. [Rate Limiting](#23-rate-limiting)
24. [SEO / LLM Accessibility](#24-seo--llm-accessibility)
25. [Feature Flags & Conditional Behavior](#25-feature-flags--conditional-behavior)
26. [Data Integration & Caching](#26-data-integration--caching)
27. [PWA / Service Worker](#27-pwa--service-worker)
28. [Shared UI Components](#28-shared-ui-components)
29. [Analytics & Telemetry](#29-analytics--telemetry)

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
| **Settings** | Gear icon links to `/settings` page (see FEAT-SETTINGS-001). Rate Limit Drawer also links to `/settings`. |
| **Wallet connector** | Connect/disconnect wallet button (see FEAT-WALLET). |
| **Feature bar** | Colored banner when running on a non-production feature branch (see FEAT-FLAGS-004). |

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

### FEAT-CHROME-004 — Go Back Button

| Aspect | Detail |
|--------|--------|
| **Behavior** | Renders a Back button in PageHeader only when `window.history.state.idx > 0`. Otherwise hidden. |

### FEAT-CHROME-005 — Localnet Unavailable Modal

| Aspect | Detail |
|--------|--------|
| **Condition** | `networkName === "local"` and local node at `http://127.0.0.1:8080/v1` is unreachable. |
| **Detection** | Polls local node every 30s with 2s timeout, checks for `chain_id` in response. |
| **Display** | Modal with "Cannot connect to local node", `aptos node run-local-testnet --with-indexer-api` command, "Switch to Mainnet" button. |

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
| `.apt` / `.petra` suffix | ANS name lookup via ts-sdk (`getPrimaryName`, `getName`) → account link |
| Valid Move struct | Coin lookup via `CoinInfo` resource + Panora coin list prefix match |
| Numeric | Parallel: block by height, transaction by version, block by version |
| 32-byte hex | Parallel: transaction hash, account address, coin list |
| Valid account address | Account, FA metadata, object core, resources, coin list, owned objects fallback |
| Emoji-only (`/^\p{Emoji}+$/gu`) | Emojicoin market lookup: derives market address from `EMOJICOIN_REGISTRY_ADDRESS` via `createNamedObjectAddress`, verifies on-chain, returns coin + LP results |
| Generic text (length > 2) | Coin list name/symbol match + known address label match |

### FEAT-SEARCH-003 — Search Results

| Aspect | Detail |
|--------|--------|
| **Result types** | Account, Address, Transaction, Block, Coin, Fungible Asset, Object. |
| **Grouping** | Results grouped by type with section headers. |
| **Deduplication** | Prefer coin list coin over struct coin; drop redundant "Address" when Account/FA/Object exists. |
| **Avatars** | Token logos, known-address brand marks via `identiconKey`, blockies fallback. |
| **Fallback** | Valid-looking address with no on-chain hits → `anyOwnedObjects` check → still link to `/account/...` via `createFallbackAddressResult`. |
| **GTM event** | `searchStats` event with `network`, `searchText`, `searchResult` ("notFound" or "success"), `duration`. |

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

### FEAT-TXLIST-003 — Table Columns & Virtualization

| Aspect | Detail |
|--------|--------|
| **Columns** | Version, type, timestamp, sender, function, gas. |
| **Pagination** | Cursor-based pagination with start param. |
| **Virtualization** | Uses `@tanstack/react-virtual` via `VirtualizedTableBody` when row count > 20. |

---

## 4. Transaction Detail

**Route**: `/txn/$txnHashOrVersion/$tab`

### FEAT-TXN-001 — Tab Selection by Type

| Transaction Type | Available Tabs |
|------------------|----------------|
| User | Overview, Balance Change, Events, Payload, Changes, Trace |
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
| **Actions section** | Rich parsing of DEX swaps, LSD operations, liquidity events (see FEAT-TXN-009). |
| **Gas** | Gas fee, storage refund, net gas, gas unit price, max gas, VM status. |
| **Block** | Link to parent block. |
| **Timestamps** | Expiration and execution timestamp. |
| **Signature** | Table-style breakdown (same layout family as FeeStatement on Events); hex fields use expandable hash chips; nested or unknown shapes fall back to JSON. |
| **Hashes** | State, event, and accumulator root hashes. |
| **Replay protection** | Nonce display when applicable (vs sequence number). |

### FEAT-TXN-003 — Balance Change Tab

| Aspect | Detail |
|--------|--------|
| **Data source** | Indexer fungible asset activities when available, fallback to raw event parsing (`parseRawEventsForBalanceChanges`). |
| **Views** | Aggregated and non-aggregated balance changes. |
| **Verification filter** | Mainnet: Verified / Recognized / All asset filter via `VerifiedCell`. |
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
| **Script decompile** | For `script_payload`, embeds `ScriptBytecodeDecompiler` — decompiles hex bytecode via WASM Move decompiler, shows decompiled Move or bytecode disassembly with copy/download/expand modal. |

### FEAT-TXN-006 — Changes Tab

| Aspect | Detail |
|--------|--------|
| **Display** | Write-set changes with table-item enrichment (handle → enclosing account). |
| **Awareness** | Object/collection/token aware display. |

### FEAT-TXN-007 — Debug Section

| Aspect | Detail |
|--------|--------|
| **Display** | Accordion at bottom of Overview tab with raw JSON and fullnode API link. |

### FEAT-TXN-008 — Default Tab Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | `/txn/$hash` → `/txn/$hash/userTxnOverview`; client-side correction for non-user transactions. |
| **Invalid tab** | Redirects to the first tab for the transaction type. |

### FEAT-TXN-009 — Transaction Actions Parsing

| Aspect | Detail |
|--------|--------|
| **Location** | `UserTransactionOverviewTab.tsx` → `TransactionActionsRow`. |
| **DEX swaps** | ThalaSwap (v1, v2, CL), Liquidswap (v0, v0.5), PancakeSwap, SushiSwap, AnimeSwap, Obric, Aux Exchange, Cellana Finance, Thetis Market, Cetus, Hyperion, Tapp, Earnium. |
| **LSD/staking** | Amnis, TruFi, ThalaLSD, Kofi. |
| **Other actions** | Econia order/fill, Wormhole burn, token mint/burn, object transfer, fungible transfers, legacy token deposit/withdraw, claim fees/rewards, add/remove liquidity. |

### FEAT-TXN-010 — Transaction Trace Tab (Sentio)

| Aspect | Detail |
|--------|--------|
| **Condition** | User transactions only. Trace data fetched only on mainnet (Sentio `networkId: 1`). |
| **Data source** | Sentio call trace API (`https://app.sentio.xyz/api/v1/move/call_trace`). |
| **Display** | `CallTraceGraph` tree rendering `SentioCallTraceNode` with module/function links, gas info. |
| **Fallback** | Non-mainnet: info alert "traces are only fetched for Aptos mainnet". |
| **External link** | Link to Sentio's transaction trace viewer for mainnet transactions. |

### FEAT-TXN-011 — Argument Display

| Aspect | Detail |
|--------|--------|
| **Name resolution** | Function argument name overrides registry (see FEAT-DATA-003) → Move source extraction → positional fallback. |
| **Type badges** | `MoveFunctionParamTypeBadge` with shortened type tags (Object, String, Option, vector, etc.). |
| **Layout** | Desktop: auto-layout table with compact columns. Mobile: `ArgumentCard` stack. |

---

## 5. Blocks List

**Route**: `/blocks`

### FEAT-BLOCKS-001 — Recent Blocks Table

| Aspect | Detail |
|--------|--------|
| **Data** | Ledger info + indexer `block_metadata_transactions`. |
| **Pagination** | `?start=` cursor. |
| **Columns** | Block height (linked), proposer, timestamp, transaction count. |
| **Virtualization** | Uses `VirtualizedTableBody` for large result sets. |

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
| **Behavior** | `.apt` names resolved to addresses via ts-sdk (`getPrimaryName`, `getAccountNames`, `getName`). Primary name shown in title when available. Mainnet/testnet only. |
| **Scam check** | Known scam addresses filtered from ANS display. |

### FEAT-ACCOUNT-002 — Balance Card

| Aspect | Detail |
|--------|--------|
| **APT balance** | Formatted APT balance via `useGetAccountAPTBalance`. |
| **USD estimate** | On mainnet, fetches CoinGecko price (see FEAT-DATA-001) and shows fiat estimate with tooltip showing rate. |
| **DeFi links** | Dropdown: Lightscan (`aptos.lightscan.one/portfolio/$address`), Yield AI (`yieldai.app/portfolio/$address`). Default: Yield AI. External links with `rel="noopener noreferrer"`. |

### FEAT-ACCOUNT-003 — Banners

| Banner | Condition | Content |
|--------|-----------|---------|
| Known address branding | `useKnownAddressBranding` match | Logo (with optional `iconBadge` overlay, e.g. "0x1"), description. Per-network data from `knownAddressBranding.ts`. |
| Defunct protocol | Mainnet, `getDefunctProtocol` match | "MAY BE DEFUNCT" warning. "Withdraw Funds" button if withdrawal plugin exists (currently no plugins registered). Dialog shows owner %, operator fee, entry function, but no in-app tx submission. |
| Aptos Names promo | `useGetInDevMode` true (dev/earlydev mode) | ANS claim CTA. |
| Petra Vault (multisig) | Account is multisig | "MULTISIG" pill + Petra Vault onboarding link. |

### FEAT-ACCOUNT-004 — Object Detection & Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | If address at `/account/...` is a pure object (has `ObjectCore` but no `0x1::account::Account` resource) → redirect to `/object/...`. |
| **Path preservation** | Uses `pathname.replace(/^\/account\//, "/object/")` so the full path (including `/modules/code/...` suffixes) and query string are preserved. |

### FEAT-ACCOUNT-005 — Tab Set (Account)

| Condition | Tabs |
|-----------|------|
| GraphQL on | transactions, coins (Assets), tokens (NFTs), resources, modules, info |
| GraphQL off | transactions, resources, modules, info |
| Multisig + GraphQL | transactions, multisig, coins, tokens, resources, modules, info |
| Object + GraphQL | transactions, coins, tokens, resources, modules, info |
| Object − GraphQL | transactions, resources, modules, info |

### FEAT-ACCOUNT-006 — Transactions Tab

| Aspect | Detail |
|--------|--------|
| **Mode selection** | Implicit — GraphQL available → `AccountAllTransactions` (all involvement); otherwise → `AccountTransactions` (sender-only via REST). No user-facing toggle. |
| **Function filter** | `?fn=` filter support. |
| **Pagination** | Cursor-based. |
| **Rate limit handling** | GraphQL path has retry + exponential backoff + user message on 429. |

### FEAT-ACCOUNT-007 — Assets (Coins) Tab

| Aspect | Detail |
|--------|--------|
| **Data** | `useGetAllAccountCoins` merged with Panora/coin list. |
| **Table** | Asset name, symbol, balance, type. Virtualized for large sets. |

### FEAT-ACCOUNT-008 — NFTs (Tokens) Tab

| Aspect | Detail |
|--------|--------|
| **Data** | `useGetAccountTokens` with count. |
| **Table** | Token name, collection, property version, amount. |
| **Scam detection** | Collections in `labsBannedCollections` → "Dangerous" icon with tooltip (reason text). |
| **Pagination** | `?page=` param, 20 per page. |

### FEAT-ACCOUNT-009 — Resources Tab

| Aspect | Detail |
|--------|--------|
| **Display** | Collapsible cards per Move resource type with JSON viewer (`JsonViewCard`). |

### FEAT-ACCOUNT-010 — Info Tab

| Aspect | Detail |
|--------|--------|
| **Account info** | Sequence number, auth key (rotation hint). |
| **Object info** | Owner, transferability. |
| **Object refs** | Transfer/delete/extend ref chips via `useGetObjectRefs` (scans nested structures in transaction data). |

### FEAT-ACCOUNT-011 — Multisig Tab

| Aspect | Detail |
|--------|--------|
| **Data** | `0x1::multisig_account::MultisigAccount` resource. |
| **Display** | Required signatures, next sequence number, owners (hash buttons), pending transactions (creator, time, votes), event counters (create/execute/reject/vote/add/remove owners/update threshold), raw JSON. |

### FEAT-ACCOUNT-012 — Default Tab Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | `/account/$address` → `/account/$address/transactions`. Same for `/object/$address`. |
| **Legacy params** | `?tab=` → `/$tab`; `?modulesTab=` on exact 2-segment path → modules route. Network param preserved. |

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

### FEAT-MODULES-005 — Cross-Module Code Navigation

| Aspect | Detail |
|--------|--------|
| **Detection** | Regex matches `module::function` and `0x..::module::function` references in highlighted Move source. |
| **Injection** | `injectMoveCodeLinksInHighlightRows` wraps matches with `<span>` elements with `data-move-fn-link`, `role="link"`, keyboard accessibility (Enter/Space). |
| **Navigation** | Click: in-app navigate to `/account/<addr>/modules/code/<module>/<function>`. Cmd/Ctrl+click: open in new tab. |
| **SSR safety** | `sanitizeHljsAstForReactDom` normalizes highlight.js AST for React DOM compatibility. |

### FEAT-MODULES-006 — Function Argument Names

| Aspect | Detail |
|--------|--------|
| **Registry** | `app/data/functionArgumentNameOverrides/` — per-address/module/function argument name overrides. |
| **Resolution order** | Override registry → Move source extraction (ABI alignment, signer slots dropped) → positional fallback (`#0`, `#1`, ...). |
| **Display** | Named columns in Run/View forms and transaction argument tables. |

### FEAT-MODULES-007 — Default Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | `/account/$address/modules` → `/account/$address/modules/packages`. |

### FEAT-MODULES-008 — Missing package metadata and modules

| Aspect | Detail |
|--------|--------|
| **Data** | Packages/Code use `0x1::code::PackageRegistry`; Run/View also use `/accounts/{address}/modules`. |
| **Loading** | While package registry is pending, Packages and Code show a centered spinner instead of an empty “No Data” state. |
| **Registry fetch error** | Non-404 failures render `AccountError` (same pattern as other account resources). |
| **Empty registry (404)** | Missing `PackageRegistry` (HTTP 404) is treated as an empty package list (`isError` false), then explanatory copy: modules may still exist on chain; point users to the Code or Run/View tab and REST module endpoints as appropriate. |
| **No modules (404 on modules API)** | Run/View show **“No modules found”** (modules API 404) with explanatory copy. |
| **Modules route + account resources 404** | On `/account/.../modules/...` or `/object/.../modules/...`, a 404 from the account resources list does not show the layout **“Account Not Found”** banner so tab content can show the correct modules empty/error state. |
| **Diff mode** | Published-source diff waits on package queries (`isPending`) instead of treating empty package lists as loading forever; package query errors surface via `AccountError`. |

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
| **Data** | GCS `validator_stats_v2.json` (mainnet/testnet) + on-chain `ValidatorSet`. |
| **Columns** | Staking pool address, operator address, voting power (sortable), rewards performance %, last epoch performance, location (city, country). |
| **Sorting** | Filters zero voting power by default. |
| **Mobile** | Card layout. |

### FEAT-VALIDATORS-003 — Delegation Table

| Aspect | Detail |
|--------|--------|
| **Columns** | Status, commission, delegator count, rewards earned, delegated amount. |
| **Wallet-aware** | "My deposit" column when wallet connected (`DEFAULT_COLUMNS` vs `COLUMNS_WITHOUT_WALLET_CONNECTION`). |
| **Virtualization** | Uses `VirtualizedTableBody`. |

### FEAT-VALIDATORS-004 — Validators Map

| Aspect | Detail |
|--------|--------|
| **Condition** | Mainnet only. |
| **Technology** | `react-simple-maps` (`ComposableMap`), client-only dynamic import. |
| **Toggle** | By City / By Country grouping. |
| **Markers** | Circle size scales with node count; country mode shows city breakdown in tooltip. |
| **Metrics** | `MapMetrics` beside/below map (epoch via `useGetEpochTime`, validator count, etc.). |

### FEAT-VALIDATORS-005 — Out-of-Commission Banner

| Aspect | Detail |
|--------|--------|
| **Display** | `OutOfCommissionPoolsBanner` at top of validators page. |

### FEAT-VALIDATORS-006 — Default Tab Redirect

| Aspect | Detail |
|--------|--------|
| **Behavior** | `/validators` → `/validators/all`. `/validators-enhanced` → `/validators/all`. `/validators-enhanced/$tab` → `/validators/$tab`. |

### FEAT-VALIDATORS-007 — Epoch Display

| Aspect | Detail |
|--------|--------|
| **Data** | `useGetEpochTime` — reads `0x1` reconfiguration resources for epoch number, interval, and time. |
| **Display** | `IntervalBar` component with `EPOCH` mode showing hours/minutes/seconds countdown. Tooltip on completion: "Please refresh the page." |

---

## 10. Validator Detail (Delegatory)

**Route**: `/validator/$address`

### FEAT-VALDEL-001 — Validator Info

| Aspect | Detail |
|--------|--------|
| **Data** | `0x1::stake::StakePool` resource + `useGetValidators` + delegation pool list. |
| **Display** | `ValidatorTitle`, `ValidatorDetailCard` (operator, performance, delegation state, time bars via `IntervalBar` with `UNLOCK_COUNTDOWN` mode). |

### FEAT-VALDEL-002 — Commission Change Banner

| Aspect | Detail |
|--------|--------|
| **Condition** | Pending commission change detected. |
| **Display** | Banner with commission change details. |

### FEAT-VALDEL-003 — Staking Bar & Operations

| Aspect | Detail |
|--------|--------|
| **Display** | `ValidatorStakingBar` with metrics + "Stake" CTA. |
| **Operations** | `add_stake`, `unlock`, `reactivate_stake`, `withdraw` via `0x1::delegation_pool`. |
| **Dialog** | `StakeOperationDialog` with amount validation (`useAmountInput`, `getStakeOperationAPTRequirement`), wallet integration. |

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
| **Display** | Sortable table of coins and fungible assets. Virtualized. Desktop body scrolls inside a max-height container (`min(70vh, 720px)`) so the virtualizer has a stable scroll element. |
| **Filters** | Verified / Recognized / All and optional “Show Emojicoins” toggle; search by name, symbol, or address. |
| **Market data** | On mainnet, CoinGecko market data merged when `coinGeckoId` available (see FEAT-DATA-001). Panora price fallback. |
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
| **Data** | `CoinInfo` resource, supply limit, paired FA via `useGetCoinPairedFa`. |
| **Display** | Coin name, symbol, decimals, supply, paired fungible asset link. |

### FEAT-COIN-003 — Verification Banner

| Aspect | Detail |
|--------|--------|
| **Levels** | Native Token, Labs Verified, Community Verified → green alert. Recognized → warning "recognized but not fully verified". Unrecognized → warning "not verified" + "Get Verified" link to `/verification`. |
| **Data** | `VerifiedCell` logic using Panora/coin list + FA pairing. |

### FEAT-COIN-004 — Holders Tab

| Aspect | Detail |
|--------|--------|
| **Data** | Top holders via indexer. |
| **Table** | Address, balance, percentage columns. |

### FEAT-COIN-005 — Transactions Tab

| Aspect | Detail |
|--------|--------|
| **Data** | Coin activity history via indexer. |

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
| **Data** | FA metadata, supply, paired coin via `useGetFaPairedCoin`. |
| **Display** | Name, symbol, decimals, supply, icon, paired coin link. |
| **Properties** | `FaPropertiesDisplay` — mint/burn/transfer flags derived from resource data. |

### FEAT-FA-003 — Verification Banner

| Aspect | Detail |
|--------|--------|
| **Display** | Same verification banner levels as Coin pages (FEAT-COIN-003). |

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
| **Image** | Fetches metadata JSON to resolve image URL (including `ipfs://` → gateway URL support). Loading states. |
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
| TPS (current + peak 30d) | `useGetTPS` / `useGetPeakTPS` (mainnet peak from analytics JSON) |
| Active Nodes | Live chain hook |

### FEAT-ANALYTICS-005 — Data Source

| Aspect | Detail |
|--------|--------|
| **URL** | GCS `chain_stats_v2.json` with cache version busting. |
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
| **Network sync** | Wallet network synced to `useNetworkName()`. Hidden networks → `"local"` for adapter compatibility. |
| **Aptos Connect** | Supports Aptos Connect dApp ID. |
| **Wallet sorting** | Petra sorted first via `sortPetraFirst`. |

### FEAT-WALLET-002 — Transaction Submission

| Aspect | Detail |
|--------|--------|
| **Hook** | `useSubmitTransaction`. |
| **Validation** | Enforces wallet network matches explorer network (exception for Google Aptos Connect). |
| **Flow** | Signs via wallet adapter, confirms via explorer's Aptos client polling. |

### FEAT-WALLET-003 — Account Navigation

| Aspect | Detail |
|--------|--------|
| **Behavior** | On connect, navigates to connected account page. |
| **GTM event** | `walletConnection` event with `walletAddress`, `walletName`, `network`. |

---

## 18. Settings

### FEAT-SETTINGS-001 — Settings Page

| Aspect | Detail |
|--------|--------|
| **Route** | `/settings` — dedicated full-page settings (replaced the former header popup dialog). |
| **Navigation** | Header gear icon and mobile nav "Settings" item link to `/settings`. Rate Limit Drawer "Set API key override" button also links there. |
| **API key overrides** | One optional masked geomi.dev API key field per network (mainnet, testnet, devnet, decibel, shelbynet, local); shared show/hide toggle for all fields. Empty network uses the build default key (if any). An info icon next to the section title opens a popover explaining that a personal key provides a dedicated rate limit (useful for heavy use or after HTTP 429) and links to geomi.dev. |
| **Migration** | Previously saved single-key settings load as the same key applied to every network until the user saves again. |
| **Persistence** | "Remember on this device" → localStorage, cross-tab sync via `storage` events. Non-API-key preferences (e.g. decompilation) persist to localStorage. |
| **On save** | Clears cached SDK clients (`clearCachedV2Clients`, `clearCachedSearchClients`), invalidates all React Query queries, invalidates router. If non-empty API key saved, fires `emitApiKeySaved()` to dismiss rate-limit drawer (see FEAT-RATELIMIT-001). |

### FEAT-SETTINGS-002 — Decompilation Opt-In

| Aspect | Detail |
|--------|--------|
| **Toggle** | "Move Bytecode Decompilation" switch on the Settings page. Disabled by default. |
| **Disclaimer** | Warning alert explaining decompiled output may not match original source; user must acknowledge that output is as-is and they accept responsibility for use. |
| **Gating** | When disabled, "Decompiled" and "Disassembly" view buttons are hidden on module code pages, script bytecode decompiler, and module diff view. Only "Published Source" and "ABI" remain visible. |
| **Persistence** | Stored in `enableDecompilation` field of `ExplorerClientSettings` in localStorage. |

---

## 19. Theme / Color Mode

### FEAT-THEME-001 — Light / Dark Mode

| Aspect | Detail |
|--------|--------|
| **Toggle** | Icon button in header. |
| **Persistence** | Cookie (`COLOR_MODE_COOKIE`) + system preference detection. |
| **Implementation** | MUI `ThemeProvider` via `ProvideColorMode`. |
| **Light theme** | Neutral grey app background (`#ECEEF2`), white cards/panels, cooler borders, soft grey stripes for tables and filled inputs. Body text ink (`#171612`). |
| **Dark theme** | Dark canvas with brand colors. |
| **WCAG** | Semantic colors tuned for WCAG 2.1 AA contrast (regression tested in `aptosBrandColors.a11y.test.ts`). |
| **Typography** | IBM Plex Sans (UI), IBM Plex Serif (display headings), IBM Plex Mono (data/code). |

---

## 20. Network Selection

### FEAT-NETWORK-001 — Network Selector

| Aspect | Detail |
|--------|--------|
| **Param** | `?network=` in URL. |
| **Behavior** | Navigate to same path with new network param, `replace: true`. |
| **Visible networks** | mainnet, testnet, devnet + localnet (`local`) shown separately. |
| **Hidden networks** | `decibel`, `shelbynet` — in `networks` map but filtered from dropdown. Wallet adapter sees them as `"local"`. |
| **Persistence** | Cookie fallback when no URL param. SSR special-cases `local`. |
| **Sync** | All data hooks read network from URL/global config. Client cache is per-network. |

### FEAT-NETWORK-002 — Network Preserved on Navigation

| Aspect | Detail |
|--------|--------|
| **Behavior** | Custom `Link` and `useNavigate` from `app/routing.tsx` merge current `network` into `search` on every navigation. `useSearchParams` and `useAugmentToWithGlobalSearchParams` also preserve it. |

---

## 21. Routing & Navigation

### FEAT-ROUTING-001 — File-Based Routes

| Aspect | Detail |
|--------|--------|
| **System** | TanStack Router file-based routing (30 route files). Dot segments = path segments. |
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
| **Splat parsing** | `pathSplatToSegments` normalizes TanStack Router's `_splat` catch-all into path segments (handles strings, arrays, null). |

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
| **Chunk errors** | `isModuleFetchError` detection → "Update Available" card with Refresh + native home link (avoids router if broken). |
| **General errors** | "Something went wrong" + error message, dev-only stack trace, Try Again (if `reset` provided), Go Home. |

### FEAT-ERROR-002 — Not Found

| Aspect | Detail |
|--------|--------|
| **Display** | 404 page with Go Home link. |

### FEAT-ERROR-003 — Suspense Fallback

| Aspect | Detail |
|--------|--------|
| **Behavior** | Root wraps `<Outlet />` in `<Suspense fallback={<Fallback />}>`. |

---

## 23. Rate Limiting

### FEAT-RATELIMIT-001 — Rate Limit Drawer

| Aspect | Detail |
|--------|--------|
| **Trigger** | HTTP 429 or "Too Many Requests" error detected in API client, queries, or router error handler via `emitRateLimit()`. |
| **Display** | Persistent bottom `Drawer` (non-blocking) informing user of rate limit, offering "Set API key override" button (opens Settings) or wait ~5 minutes. Link to geomi.dev for key. |
| **Auto-clear** | Rate limit state auto-clears after 5 minutes (`RATE_LIMIT_WINDOW_MS`). |
| **Dismiss** | Close icon dismisses drawer while timer continues. |
| **API key grace** | On saving an API key in Settings, rate-limit state clears and new 429 handling is suppressed for 10 seconds (`API_KEY_GRACE_MS`) to prevent stale in-flight 429s from re-triggering. |

### FEAT-RATELIMIT-002 — Client-Side Throttling

| Aspect | Detail |
|--------|--------|
| **Mechanism** | Token-bucket per-endpoint queue with retry + exponential backoff in `app/utils/rateLimiter.ts`. |
| **Per-feature handling** | Account transactions GraphQL path: retry + backoff + user message. CoinGecko: batching (250/request) + 1500ms inter-batch delay + 429 handling. |

### FEAT-RATELIMIT-003 — API Error Classification

| Aspect | Detail |
|--------|--------|
| **Hook** | `withResponseError` in `app/api/client.ts`. |
| **Mappings** | 429 → `TOO_MANY_REQUESTS` + `emitRateLimit()`; 404 → `NOT_FOUND`; 400 → `INVALID_INPUT`; Error with "too many requests" → rate limit; other → `UNHANDLED`. |

---

## 24. SEO / LLM Accessibility

### FEAT-SEO-001 — Page Metadata

| Aspect | Detail |
|--------|--------|
| **Hook** | `usePageMetadata` sets title, description, canonical URL, JSON-LD structured data per page type. |
| **JSON-LD types** | `WebSite` (home with `SearchAction`), `Article`, `WebPage`, `CollectionPage`, entity-specific schemas. |
| **Search action** | `/?search={search_term_string}`. |

### FEAT-SEO-002 — LLM Documentation

| File | Purpose |
|------|---------|
| `public/llms.txt` | Short LLM reference (llmstxt.org standard). |
| `public/llms-full.txt` | Full reference with API docs and examples. |
| `public/robots.txt` | Bot crawl rules including named AI crawlers. |
| `public/sitemap.xml` | Static URL list for crawlers. |

### FEAT-SEO-003 — Drift Tests

| Aspect | Detail |
|--------|--------|
| **Test** | `app/utils/llmsRouteCoverage.test.ts` ensures `llms.txt` / `llms-full.txt` cover all core path snippets. |

---

## 25. Feature Flags & Conditional Behavior

### FEAT-FLAGS-001 — GraphQL / Indexer Support

| Aspect | Detail |
|--------|--------|
| **Check** | `useGetIsGraphqlClientSupported` — true when indexer URL configured for network. |
| **Affects** | Coin/FA holders+transactions tabs, account coins+tokens tabs, account all-transactions mode, balance changes, table items, search enrichment. |

### FEAT-FLAGS-002 — Mainnet-Only Features

| Feature | Detail |
|---------|--------|
| Analytics page | Charts only render on mainnet. |
| Validators map | Only on mainnet. |
| APT/USD price | CoinGecko only on mainnet. |
| Peak TPS | Only on mainnet. |
| Analytics data | GCS JSON only fetched on mainnet. |
| Defunct protocol banners | Only on mainnet. |
| Transaction trace (Sentio) | Only on mainnet. |

### FEAT-FLAGS-003 — Dev Mode / Feature Name

| Aspect | Detail |
|--------|--------|
| **Check** | `useGetInDevMode` / `useFeatureName()`. |
| **Resolution** | Priority: `feature_name` cookie → `VITE_FEATURE_NAME` env var → default `"prod"`. |
| **Valid values** | `"prod"` (default), `"dev"` (Development Mode), `"earlydev"` (Early Development Mode). |
| **Feature bar** | Non-prod → red banner: "This is the {featureLabel}." |
| **Affects** | Aptos Names promo banner (only in dev/earlydev mode). |

### FEAT-FLAGS-004 — Netlify Preview

| Aspect | Detail |
|--------|--------|
| **Check** | `isNetlifyPreview`. |
| **Affects** | Suppresses VITE_* API keys on preview/branch deploy builds. |

---

## 26. Data Integration & Caching

### FEAT-DATA-001 — CoinGecko Price Integration

| Aspect | Detail |
|--------|--------|
| **Simple price** | `useGetPrice` — single coin ID (default "aptos") from CoinGecko simple/price API. Used in balance card for APT/USD. |
| **Market data** | `useGetCoinMarketData` — batch market data (250/request, 1500ms inter-batch). Mainnet only. Stale 30min, GC 6h, no refetch on window focus/mount, retry 1. |
| **Display** | Coins table merges CoinGecko data via `coinGeckoId`. Panora price fallback. |

### FEAT-DATA-002 — Known Address System

| Aspect | Detail |
|--------|--------|
| **Registry** | Per-network `knownAddresses` (label map) + `knownAddressBranding` (icon, description, `iconBadge`). Networks: mainnet, testnet, devnet. Unknown networks fall back to mainnet. |
| **Display** | Hash buttons: ANS + known name + scam check via `useGetNameFromAddress`. Account titles: `useKnownAddressName` / `useKnownAddressBranding`. Search: `handleLabelLookup` matches against known address labels. |
| **Branding** | Icons under `public/address-icons/`. Framework accounts share `aptosFrameworkAddressBranding.ts`. `iconBadge` overlays short text on brand icons (e.g. `0x1`). |

### FEAT-DATA-003 — Function Argument Name Overrides

| Aspect | Detail |
|--------|--------|
| **Registry** | `app/data/functionArgumentNameOverrides/` — maps `stdAddr::module::function` → argument name arrays. |
| **Lookup** | `lookupFunctionArgumentNameOverride(moduleAddress, moduleName, functionName, nonSignerArgCount)`. Uses last N entries when count matches. |
| **Consumers** | Transaction argument table (`TransactionArguments.tsx`), Run/View contract forms (`Contract.tsx`). |

### FEAT-DATA-004 — Identicons

| Aspect | Detail |
|--------|--------|
| **Technology** | `@download/blockies` — generates seed-based identicon images from addresses. |
| **Overrides** | Optional `iconSrc` from branding; falls back to blockie on load error. Optional `iconBadge` overlay. |
| **Usage** | `HashButton`, `SearchResultAvatar`, `CoinBalanceChangeTable`. |

### FEAT-DATA-005 — Emojicoin Registry

| Aspect | Detail |
|--------|--------|
| **Address** | `EMOJICOIN_REGISTRY_ADDRESS` in `app/data/index.ts`. |
| **Market derivation** | `deriveEmojicoinPublisherAddress` via `createNamedObjectAddress({ creator: REGISTRY, seed: symbolBytes })`. |
| **Usage** | Search: emoji input → derive market address → verify on-chain → coin + LP results. Verification: `VerifiedCell` classifies emoji symbol coins. |

---

## 27. PWA / Service Worker

### FEAT-PWA-001 — Progressive Web App

| Aspect | Detail |
|--------|--------|
| **Manifest** | `public/manifest.json` — standalone display, Aptos theme colors (`#0F0E0B`), icons, screenshots, categories. |
| **Service worker** | `public/sw.js` — manual registration (not Vite plugin, for SSR compatibility). Caches static assets (favicons, manifest), fetch handler with Aptos Labs domain checks, install/activate lifecycle. |
| **Registration** | `index.html` registers `/sw.js` with `navigator.serviceWorker.register`. |

---

## 28. Shared UI Components

### FEAT-UI-001 — Table Virtualization

| Aspect | Detail |
|--------|--------|
| **Component** | `VirtualizedTableBody` using `@tanstack/react-virtual`. |
| **Threshold** | Virtualizes when row count > 20 (configurable per call site, e.g. 15). |
| **Render mode** | Optional `rowCount` + `renderRow(index)` so large lists do not pre-build a React child per row (used on `/coins`). |
| **Consumers** | Transactions, Blocks, Coins, Account Assets, Account Tokens, Delegation Validators tables. |

### FEAT-UI-002 — Verification Cell

| Aspect | Detail |
|--------|--------|
| **Levels** | `NATIVE_TOKEN`, `LABS_VERIFIED`, `COMMUNITY_VERIFIED`, `RECOGNIZED`, `UNRECOGNIZED`, `LABS_BANNED`, `COMMUNITY_BANNED`, `DISABLED`. |
| **Display** | Verification badges/icons on coin/FA tables. Emojicoin market detection via registry address. |

### FEAT-UI-003 — Interval Bar

| Aspect | Detail |
|--------|--------|
| **Modes** | `EPOCH` (hours/minutes/seconds countdown), `UNLOCK_COUNTDOWN` (days-heavy for staking locks). |
| **Completion** | Tooltip: "Please refresh the page…" |
| **Usage** | Validators epoch display, delegatory validator unlock countdown. |

### FEAT-UI-004 — Side Drawer

| Aspect | Detail |
|--------|--------|
| **Component** | MUI `Drawer`, anchor right, 80% width mobile, 33% desktop. |
| **Usage** | `StakingDrawer` (Delegated Staking FAQ with accordion sections — currently not wired into routes). |

---

## 29. Analytics & Telemetry

### FEAT-TELEMETRY-001 — Google Tag Manager

| Aspect | Detail |
|--------|--------|
| **Script** | GTM injected via `initGTM` (defined in `useGoogleTagManager.ts`). |
| **Events** | `walletConnection` (address, name, network) on wallet connect. `searchStats` (network, text, result, duration) on search completion. |
| **Data layer** | Pushes to `window.dataLayer`. |

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
| `app/utils/cliCommand.test.ts` | CLI command generation from payloads |
| `app/utils/moveDecompiler.test.ts` | FEAT-MODULES-004 (decompiler helpers) |
| `app/utils/moveCodeNavigation.test.ts` | FEAT-MODULES-005 (cross-module link path building and resolution) |
| `app/utils/moduleErrorHandler.test.ts` | FEAT-ERROR-001 (chunk error handling, reload behavior) |
| `app/utils/llmsRouteCoverage.test.ts` | FEAT-SEO-003 (LLM doc drift) |
| `app/utils/routerParams.test.ts` | FEAT-ROUTING-003 (`pathSplatToSegments` normalization) |
| `app/utils/sentioCallTrace.test.ts` | FEAT-TXN-010 (Sentio helpers: network ID, paths, address normalization, node validation) |
| `app/api/client.test.ts` | FEAT-RATELIMIT-003 (API error classification, 429 → `emitRateLimit`) |
| `app/api/hooks/useGetObjectRefs.test.ts` | FEAT-ACCOUNT-010 (object ref detection in transactions) |
| `app/api/hooks/useGetAccountResource.test.ts` | FEAT-MODULES-008 (`mapRegistryQueryToAccountPackages`: 404 → empty packages, not error) |
| `app/api/hooks/useGetFaProperties.test.ts` | FEAT-FA-002 (FA property derivation from resources) |
| `app/context/rate-limit/RateLimitContext.test.tsx` | FEAT-RATELIMIT-001 (rate limit context state management) |
| `app/context/rate-limit/rateLimitEvents.test.ts` | FEAT-RATELIMIT-001 (rate limit event detection) |
| `app/context/rate-limit/settingsEvents.test.ts` | FEAT-SETTINGS-001 / FEAT-RATELIMIT-001 (settings ↔ rate-limit event bridge) |
| `app/global-config/useFeatureName.test.ts` | FEAT-FLAGS-003 (cookie → env → default resolution) |
| `app/data/knownAddressBranding.test.ts` | FEAT-DATA-002 (known address branding lookups per network) |
| `app/data/knownAddresses.test.ts` | FEAT-DATA-002 (known address system: labels, branding, fallback), FEAT-DATA-005 (emojicoin registry address) |
| `app/data/defunctProtocols.test.ts` | FEAT-ACCOUNT-003 (defunct protocol registry shape, uniqueness) |
| `app/data/functionArgumentNameOverrides/lookup.test.ts` | FEAT-DATA-003 / FEAT-MODULES-006 (argument name override lookup) |
| `app/types/defunctProtocol.test.ts` | FEAT-ACCOUNT-003 (withdrawal plugin validation) |
| `app/settings/clientSettings.test.ts` | FEAT-SETTINGS-001 (settings persistence, sanitization) |
| `app/themes/colors/aptosBrandColors.a11y.test.ts` | FEAT-THEME-001 (WCAG contrast regression) |
| `app/components/hooks/usePageMetadata.structuredData.test.ts` | FEAT-SEO-001 (JSON-LD generation) |
| `app/components/IndividualPageContent/ContentValue/CurrencyValue.test.tsx` | Currency formatting (octa → APT) |
| `app/components/Table/verifiedLevel.test.ts` | FEAT-COIN-003 / FEAT-UI-002 (verification level determination: native, verified, banned, recognized, unverified, disabled) |
| `app/pages/Transaction/utils.test.ts` | FEAT-TXN-002/003 (tx amounts, counterparty, balance changes) |
| `app/pages/Transaction/Tabs/Components/SignatureOverviewTable.test.tsx` | FEAT-TXN-002 (signature overview: Ed25519, multi-Ed25519, single_sender, multi_agent, fee_payer, fallbacks; stable keys for duplicate secondary addresses) |
| `app/pages/Transaction/Tabs/Components/moveParamTypeDisplay.test.ts` | FEAT-TXN-011 (Move type display badges) |
| `app/pages/Transaction/txnTabValues.test.ts` | FEAT-TXN-001 (tab selection by transaction type, trace tab only for user txns) |
| `app/pages/Transaction/txnTabInvariants.test.ts` | FEAT-TXN-009 (DEX/LSD protocol coverage), TransactionTypeName enum values |
| `app/pages/Account/hooks/useAccountTabValues.test.ts` | FEAT-ACCOUNT-005 (tab set computation: all GraphQL/object/multisig combos, invariants) |
| `app/pages/Account/Tabs/ModulesTab/Contract.test.ts` | FEAT-MODULES-001 (contract result utilities, copy serialization) |
| `app/pages/Account/Error.test.tsx` | FEAT-MODULES-008 (`AccountError` optional NOT_FOUND title/message) |
| `app/pages/layout/Search/searchUtils.test.ts` | FEAT-SEARCH-003 (fallback address results) |
| `app/pages/layout/Search/searchDetection.test.ts` | FEAT-SEARCH-002 (all input type detection: ANS, struct, numeric, hex, address, emoji, generic) |
| `app/pages/layout/Search/searchFiltering.test.ts` | FEAT-SEARCH-003 (result filtering/deduplication, grouping with headers and type ordering) |
| `app/pages/layout/Search/searchHelpers.test.ts` | FEAT-SEARCH-001 (normalization, cache keys), FEAT-SEARCH-002 (label lookup, coin lookup), FEAT-SEARCH-003 (definitiveResult) |
| `app/lib/networks.test.ts` | FEAT-NETWORK-001 (network config, hidden networks, localnet), FEAT-FLAGS-003 (feature labels) |
| `app/lib/graphqlSupport.test.ts` | FEAT-FLAGS-001 (GraphQL URI per network), FEAT-COIN-001/FEAT-FA-001 (tab gating logic) |
| `app/lib/validators.test.ts` | FEAT-NETWORK-001 (network name validation), FEAT-FLAGS-003 (feature name validation), well-known constants |
| `app/utils/routeRedirects.test.ts` | FEAT-ACCOUNT-012 (entity default tab redirects for all route types), FEAT-TOKEN-004 (legacy numeric redirect), FEAT-VALIDATORS-006 (validators/validators-enhanced redirects), FEAT-SEARCH-001 (header search navigation), FEAT-WALLET-002 (wallet network mismatch), FEAT-ACCOUNT-002 (DeFi portfolio URLs) |
| `app/utils/rateLimiter.test.ts` | FEAT-RATELIMIT-002 (rate limit error detection, URL endpoint extraction) |
| `app/utils/utilsCoverage.test.ts` | FEAT-ROUTING-003 (isValidStruct), FEAT-TXN-002 (sortTransactions), FEAT-WALLET-001 (sortPetraFirst), FEAT-MODULES-004 (bytecode size), FEAT-MODULES-001 (param names, function line numbers), isValidUrl, assertNever |
| `app/data/bannedCollections.test.ts` | FEAT-ACCOUNT-008 (scam collection detection: registry shape, hex keys, reason strings) |
| `app/data/knownAddresses.test.ts` | FEAT-DATA-002 (known address system: labels, branding, fallback), FEAT-DATA-005 (emojicoin registry address) |
| `app/pages/Validators/validatorTabs.test.ts` | FEAT-VALIDATORS-001 (tab enum values, uniqueness) |
| `app/pages/Analytics/analyticsGate.test.ts` | FEAT-ANALYTICS-001 (mainnet gate), FEAT-ANALYTICS-005 (GCS data URL) |
| `app/hooks/localnetDetection.test.ts` | FEAT-CHROME-005 (localnet URL shape: localhost, port, path) |
| `app/api/hooks/useGoogleTagManager.test.ts` | FEAT-TELEMETRY-001 (GTM event name constants) |

## Appendix C: Remaining Test Coverage Gaps

Features that require React component rendering, async I/O mocking, or extraction of currently file-private logic to be fully testable. Most pure-function paths are now covered.

### Requires Component / Integration Testing

| Feature ID | Feature | Blocker |
|------------|---------|---------|
| FEAT-TXLIST-001 | User vs All toggle | Needs component render to test `?type=` → correct child component |
| FEAT-NETWORK-002 | Network preserved on nav | Custom `Link` / `useNavigate` wrapper requires router context |
| FEAT-ACCOUNT-004 | Object detection redirect | Needs `Account/Index.tsx` component render with mocked resources |
| FEAT-CHROME-002 | Footer cache clear | Integration test with localStorage |
| FEAT-VALIDATORS-004 | Map geo data grouping | Needs component render or extraction of `useGetValidatorSetGeoData` logic |

### Requires Extraction of File-Private Logic

| Feature ID | Feature | Blocker |
|------------|---------|---------|
| FEAT-TXN-009 | Transaction actions parsing — per-protocol DEX/LSD event parsers | Parsers (`parseThalaSwapV1Event`, `parseLiquidswapV0Event`, etc.) are module-private in `UserTransactionOverviewTab.tsx`; extract to a dedicated module to unit test |
| FEAT-TXN-005 | Script bytecode decompiler trigger | `ScriptBytecodeDecompiler` is a React component; trigger condition (payload type check) is inline |
| FEAT-ROUTING-002 | Hash-to-path and old-hostname redirects | `useHashToPathRedirect`, `useOldUrlRedirect` are React hooks in root layout |

### Would Benefit from Async/Timer Mocking

| Feature ID | Feature | Blocker |
|------------|---------|---------|
| FEAT-DATA-001 | CoinGecko batch delay logic | Async with 1500ms inter-batch delays; needs fake timers |
| FEAT-RATELIMIT-002 | `retryWithBackoff` / `withRateLimit` full flow | Async with random jitter; needs mocked `Math.random` + fake timers |
