# Request Reduction & Rate-Limit Mitigation Report

> Audience: explorer maintainers and the QA / Cost Cutter / Architect roles.
> Goal: cut the number of upstream Aptos / external API calls that the explorer
> makes per visit, and shift as many of the remaining ones as possible from the
> user's browser to the server (SSR / Netlify Functions / CDN), so that an end
> user is much less likely to hit fullnode, indexer, or CoinGecko rate limits.
>
> Scope: every route under `app/routes/`, every hook under `app/api/hooks/`,
> the SSR cache in `app/ssr.tsx`, the QueryClient defaults in `app/router.tsx`,
> and the Netlify deploy headers in `netlify.toml`.
>
> Reference docs already in the repo:
> [`RATE_LIMITING.md`](../RATE_LIMITING.md),
> [`CACHING.md`](../CACHING.md),
> [`CONTEXT_OPTIMIZATION.md`](../CONTEXT_OPTIMIZATION.md).

---

## TL;DR — the highest-leverage fixes

Ranked by `(estimated request reduction) × (implementation invasiveness⁻¹)`.
None of these touch product features; they are pure plumbing changes.

| # | Change | Affects | Estimated upstream-request cut | Where |
|---|---|---|---|---|
| 1 | **Stop fan-out on transaction tables** — let the indexer return the columns we currently re-fetch from REST per row, so 25-row pages do 1 indexer call instead of 1 indexer + 25 REST | `/transactions`, `/account/$address/transactions`, every `UserTransactionsTable` mount | **~25 → ~1 per page load** (≈ 96% reduction on these pages) | `useGetUserTransactionVersions`, `useGetAccountAllTransactionVersions`, `UserTransactionRow` in `app/pages/Transactions/TransactionsTable.tsx` |
| 2 | **Move `/transactions`, `/blocks`, `/coin/*`, `/fungible_asset/*`, `/token/*`, `/object/*`, `/validators/*` to TanStack Start `loader`s** (like `/account`, `/txn`, `/block` already do) and cache the SSR HTML aggressively on the Netlify edge | every listed route | shifts N → 0 client requests for the **first paint** of each route; allows a single SSR fetch to cover many simultaneous users via `s-maxage` | `app/routes/*.tsx`, `app/ssr.tsx`, `netlify.toml` |
| 3 | **Drop the per-coin `has_confidential_store` fan-out** — combine into one indexer query (or skip until the tab is interacted with) | account `Coins` tab | up to **20 view calls → 1 indexer call** per account-coins view | `useAccountHasConfidentialStores` (`app/api/hooks/useAccountHasConfidentialStores.ts`) |
| 4 | **Cache CoinGecko via a Netlify Function** with a shared 5–10 min CDN cache, instead of one `fetch()` per browser per page load | every `BalanceCard` mount, every `useGetCoinMarketData` mount | one shared request every 5–10 min for all users globally, vs N per user | `app/api/hooks/useGetPrice.ts`, `app/api/hooks/useGetCoinMarketData.ts`, new `netlify/functions/coingecko.ts` |
| 5 | **Consolidate `["ledgerInfo", networkValue]` polling** to one writer + many readers; raise the polling interval; honor the existing per-route SSR cache instead of refetching immediately on mount | `/`, `/transactions`, `/blocks`, header components, account/txn pages | from 3 overlapping ledger-info pollers (10 s) down to 1 (30 s) | `useGetTPS`, `useGetMostRecentBlocks`, `AllTransactions`, `TotalTransactions` |
| 6 | **De-fan-out the validators page** — fetch `0x1::stake::StakePool` operators in one indexer query, not 1 REST call per pool (~150 on mainnet) | `/validators` All Nodes table fallback | up to **150 REST → 1 indexer** when the GCS stats JSON is empty | `fetchStakePoolOperators` in `useGetValidators.ts` |
| 7 | **Lengthen route preload intent delay and disable preload for known-expensive routes** | every hover/focus on a `<Link>` | cuts hover-spam fetches by an order of magnitude on long lists | `app/router.tsx` `defaultPreload` config + per-route `preload: false` |
| 8 | **Batch on-chain `view` calls into a single `/v1/view` POST per page** where possible (e.g. coin info, FA info pages issue ~5 separate views in parallel) | every coin / FA / staking page | ≈ **5–10 view POSTs → 1** | new helper around `app/api/hooks/useViewFunction.ts` |
| 9 | **Per-version REST batching for CSV export** — use `client.getTransactions({start, limit: 100})` instead of 1 REST call per version | account `Export CSV` | **N → N/100** REST calls; ~99% reduction for 10k-txn exports | `AccountAllTransactions.tsx` `CSVExportButton` |
| 10 | **Make all "immutable" routes (`/txn/$hash`, `/block/$height`, `/coin/$struct`, single FA, token) `s-maxage` 24h on the edge** (currently 1 h for txn/block; 30 s for coin/fa/token despite being effectively immutable for confirmed values) | SSR layer | edge serves repeated views for free (multiplies CDN cache hits across users) | `getSsrCacheControl` in `app/ssr.tsx` |

Hitting just items 1–4 above is expected to reduce per-visit upstream calls by
roughly **70–90%** on the most-trafficked routes (`/transactions`, `/account/$address/*`,
home page) and meaningfully reduce the load on Aptos Gateway, the indexer
GraphQL API, and CoinGecko — directly translating to fewer user-visible
rate-limit banners (`RateLimitDrawer`).

---

## 1. Where the current request volume comes from

Today every API call originates from the user's browser:

- **No proxy / Netlify function** sits between the client and Aptos Gateway,
  the indexer GraphQL endpoint, CoinGecko, or the GCS analytics buckets — each
  user pays their own rate-limit cost.
- **Only three routes pre-fetch in their loader** (`account.$address.$tab`,
  `txn.$txnHashOrVersion.$tab`, `block.$height.$tab`). Every other route
  (transactions, blocks, validators, coin, FA, token, object, analytics,
  releases, etc.) does **100% of its data fetching from the browser after
  hydration**.
- **The router uses `defaultPreload: "intent"` with `defaultPreloadStaleTime: 0`**
  (`app/router.tsx`), so hovering a `<Link>` immediately fires the destination
  route's loader. Combined with hover-heavy lists (transactions, blocks,
  account tables), this is a major hidden source of background calls.
- **Many pages fan out per-item REST calls** (one fetch per row, one fetch per
  validator pool, one fetch per coin), even when the indexer or the view-function
  endpoint can return the same data in one round-trip.

The rest of this section enumerates concrete hot-spots so future work can be
scoped surgically.

### 1.1 Transactions table N+1 (biggest single offender)

`/transactions` (User Transactions tab) and `/account/$address/transactions`
both follow the same shape:

1. **Indexer call**: `user_transactions` or `account_transactions` returns
   an array of *version numbers only* (see
   `app/api/hooks/useGetUserTransactionVersions.ts`,
   `app/api/hooks/useGetAccountAllTransactions.ts`).
2. **REST fan-out**: for each row, `<UserTransactionRow>` calls
   `useGetTransaction(version.toString())`, which hits
   `/v1/transactions/by_version/<n>` once **per visible row**
   (`app/pages/Transactions/TransactionsTable.tsx` lines 729–750, 858–869).

With the default `LIMIT = 20` (transactions) and `countPerPage = 25` (account
transactions), every page navigation issues **20–25 REST calls plus 1 indexer
call** from the user's IP. With `defaultPreload: "intent"` the preceding page
also fires when the user *hovers* a pagination link.

**Indexer schema check**: the `user_transactions` and `account_transactions`
GraphQL tables already expose `version`, `entry_function_id_str`,
`sender`, `block_height`, `timestamp`, `success`, `gas_used`, `gas_unit_price`
— i.e. every column the current `TransactionsTable` cells read. Selecting
these in the existing indexer query removes the per-row REST call entirely.

> **Suggested fix**: extend `USER_TRANSACTIONS_QUERY` and
> `ACCOUNT_TRANSACTIONS_QUERY` to return all displayable columns; rewrite
> `UserTransactionRow` to render from the row payload directly. Keep the
> existing per-version REST fetch as a fallback for unsupported networks
> (devnet without indexer support), gated on `useGetIsGraphqlClientSupported`.

### 1.2 CSV export — per-version REST fetches

`CSVExportButton.fetchAllTransactionVersions` already paginates the indexer
in 100-row chunks (good). But then `handleExport` calls
`getTransaction({txnHashOrVersion: version}, aptosClient)` **once per version**
in batches of 10, with 100–300 ms sleeps between batches
(`app/pages/Account/Components/AccountAllTransactions.tsx` line 504–540).

For the 10 000-txn cap (`MAX_DISPLAYABLE_TRANSACTIONS`) that is **10 000 REST
calls**, even though the v1 REST API exposes
`client.getTransactions({ start, limit: 100 })` for batched fetching by version
range. Switching to the batched endpoint would reduce the call count by
~100× on large exports and is the single biggest contributor to the
"export rate limited" support tickets.

### 1.3 `/blocks` and account block widgets — per-block fan-out

`getRecentBlocks` (`app/api/v2.ts`) does N concurrent `getBlockByHeight` calls
with concurrency 8 — at the default `BLOCKS_COUNT = 20` the explorer makes
**20 REST calls per `/blocks` view** (and again on every refresh / window
focus). The Aptos REST API does not currently expose a "get N most recent
blocks" endpoint, so this is the right shape **on the client**, but it is an
obvious win to move to the server:

> **Suggested fix**: add a `loader` to `app/routes/blocks.tsx` that calls
> `getRecentBlocks` inside the SSR handler with the server-side API key. With
> `s-maxage=60` (already set for `/blocks` in `getSsrCacheControl`) the CDN
> coalesces requests across all users.

### 1.4 Account `Coins` tab — `has_confidential_store` fan-out

`useAccountHasConfidentialStores`
(`app/api/hooks/useAccountHasConfidentialStores.ts`) issues up to **20 separate
`/v1/view` POSTs per visible account** to call
`0x1::confidential_asset::has_confidential_store` once per FA address. The cap
exists *because* the fan-out was tripping rate limits.

The indexer's `current_fungible_asset_balances` query already includes the
fungible asset address — and the existing per-account view call could be
replaced by a single indexer query that returns the set of metadata addresses
the user has a confidential store for. Failing that, this lookup can simply
be deferred until the row is hovered or expanded.

### 1.5 Validators page — operator-address fan-out

`fetchStakePoolOperators` (`useGetValidators.ts` line 191–226) reads
`0x1::stake::StakePool::operator_address` from on-chain **once per pool that
needs patching**, concurrency 12. When the off-chain `validator_stats_v2.json`
upload is empty (which is the documented fallback behavior the recent
"Validators page: minute-long load with wallet connected" CHANGELOG entry
already discusses), that means **~150 REST calls per mainnet visit** to the
Validators page until the GCS stats catch up.

The indexer exposes `current_staking_pool_voter` and stake-pool tables that
include `operator_address`; one query can replace the entire fan-out.

### 1.6 `BalanceCard` — bypasses React Query

`app/pages/Account/BalanceCard.tsx` calls `getPrice()` directly from a
`useEffect` instead of using the existing `useGetPrice` hook
(`app/api/hooks/useGetPrice.ts`). That means **every account page mount
fetches the APT price from CoinGecko once per user** — the React Query cache
is bypassed entirely, so opening five account pages in a session = five
CoinGecko requests instead of zero.

> **Suggested fix (trivial)**: replace the `useEffect` + `getPrice()` with
> `useGetPrice("aptos")`. This alone removes ~1 CoinGecko call per account
> page navigation.

### 1.7 Duplicate ledger-info polling

Four hooks share the React Query key `["ledgerInfo", networkValue]` but with
different `staleTime` / `refetchInterval` / `refetchOnWindowFocus` settings
(see `CACHING.md`):

- `useGetTPS` — 10 s refetchInterval, runs on every page with the TPS pill
- `useGetMostRecentBlocks` — 60 s, no focus refetch
- `AllTransactions` — 10 s refetchInterval
- `TotalTransactions` — 30 s refetchInterval

When two of these mount on the same page, **React Query uses the most
aggressive `refetchInterval`** (10 s), and the home page ends up polling the
fullnode every 10 seconds even when the user is idle. This is a small win
individually but it stacks for any user who leaves a tab open.

### 1.8 Hover preloading

`defaultPreload: "intent"` + `defaultPreloadStaleTime: 0`
(`app/router.tsx`) means every hover on a transactions row, blocks row, or
account link **fires the destination route's loader immediately**, with no
delay and no staleness allowance. On the transactions list this triggers
`transactionQueryOptions` (a `/transactions/by_version` REST call) for every
hovered row.

Recommended changes:

- Set `defaultPreloadStaleTime` to a real value (e.g. 30 s) so hover-preloaded
  data is reused instead of re-fetched.
- Consider `defaultPreload: false` for the transactions, blocks, and account
  list routes specifically — they are accessed via clicks, not "intent".
- Or use TanStack Router's per-route `preload: false`.

### 1.9 View-function pages issue many parallel `/v1/view` POSTs

Coin and FA detail pages compose several `useViewFunction` hooks in parallel
(see e.g. `useGetCoinSupplyLimit`, `useGetFASupply`, `useGetCoinPairedFa`,
`useGetFaPairedCoin`, `useGetStakingRewardsRate`, `useGetFaMetadata`,
`useGetConfidentialFASupply`). Each one is a separate
`POST /v1/view` — and the Aptos node API supports batch via a single
GraphQL `aptos_view_function` query *or* a serial `view_function` invocation.

A reasonable middle ground: introduce a `useViewFunctions(requests[])` hook
that schedules all view calls scheduled in the same microtask into a single
indexer GraphQL query (the indexer's `view` resolver accepts arrays).

### 1.10 Search panel — concurrent speculative fetches

`SearchWithResults.runSearch` (`app/pages/Search/SearchWithResults.tsx` line
258–410) issues 2–3 concurrent network calls per query, gated only by a 400 ms
keystroke debounce and an `AbortController`. For a 32-hex input it runs
`handleTransaction` and `handleAddress` in parallel — and `handleAddress`
itself can fan out to account + object + coin checks.

This is generally appropriate (the explorer **wants** to be smart about ambiguous
inputs), but the result is currently cached only in `localStorage`, not in the
React Query cache the rest of the app uses. Storing search probe results in
React Query under stable keys would let the subsequent page navigation reuse
them (e.g. `handleAddress` already does `queryClient.getQueryData(...)` for
the account lookup — extending the same pattern to transactions / objects /
coins would prevent the same call from being made twice across search→navigate).

### 1.11 SSR cache headers leave value on the table

`getSsrCacheControl` (`app/ssr.tsx`) currently sets:

- `/`, `/transactions`, `/analytics`: `s-maxage=15, stale-while-revalidate=60`
- `/blocks`, `/validators`, `/validators/*`: `s-maxage=60, stale-while-revalidate=300`
- `/txn/*`, `/block/*`: `s-maxage=3600, stale-while-revalidate=86400` ✅
- `/account/*`, `/object/*`, `/coin/*`, `/fungible_asset/*`, `/token/*`,
  `/validator/*`: `s-maxage=30, stale-while-revalidate=120`

These are reasonable for current behavior, but if the routes also pre-fetch
their data in loaders (recommendation #2 above), the SSR HTML becomes
*all* the data the first paint needs — so the cache values can be longer,
and the CDN handles N concurrent users with one origin request.

Concrete suggestions:

- `/coin/*`, `/fungible_asset/*`, `/token/*` (metadata that almost never
  changes): bump to `s-maxage=300, stale-while-revalidate=3600`.
- `/validator/*` (per-validator detail): `s-maxage=300, stale-while-revalidate=1800`.
- `/blocks`: confirmed blocks are immutable; the only volatile thing is
  *which* blocks are the most recent. Server pre-fetch + 60 s `s-maxage` is
  fine and absorbs polling for free.

### 1.12 No CDN caching of upstream API responses

Even with all the React Query in the world, every `Aptos.getTransactions()`
call goes from user IP → `api.mainnet.aptoslabs.com`. A small Netlify
Function (or fullnode-compatible edge proxy — but see the AGENTS-file warning
against Netlify Edge Functions; a regular Netlify Function is fine here) that
mirrors a handful of high-traffic, public, GET endpoints with a 5–30 s CDN
cache would:

- Serve N users from one upstream fetch (cuts per-user rate-limit hits to ~0).
- Let the server attach the production `APTOS_<NETWORK>_API_KEY`, so requests
  to the gateway use the explorer's identity instead of the user's.
- Allow Netlify to enforce its own rate limits between the user and the
  proxy without exhausting upstream limits.

Endpoints worth fronting (all GET, all idempotent, all already in use):

| Upstream | Why proxy it |
|---|---|
| `/v1/transactions?start=...&limit=...` | Hit on `/transactions`, easy to cache 5–10 s |
| `/v1/blocks/by_height/<n>` (no txns) | Immutable once finalized; effectively cache forever |
| `/v1/blocks/by_height/<n>?with_transactions=true` | Same |
| `/v1/transactions/by_version/<n>` | Immutable; cache forever |
| `/v1/transactions/by_hash/<h>` | Immutable; cache forever |
| `/v1` (ledger info) | Cache 10–30 s |
| Indexer GraphQL `current_fungible_asset_balances`, `account_transactions`, `user_transactions` | Cache 5 s |
| CoinGecko `/coins/markets`, `/simple/price` | Cache 5–10 min |
| GCS `validator_stats_v2.json`, `chain_stats_v2.json` | Cache 5 min |

> **Important**: per the workspace AGENTS.md, **do not** use Netlify Edge
> Functions for this — use regular Netlify Functions, which are also what
> currently serve the SSR handler.

---

## 2. Client-side reductions (no infrastructure change)

These can ship independently and immediately reduce the number of requests
the browser issues.

| # | Item | File(s) | Effort |
|---|---|---|---|
| C1 | Drop the per-row `useGetTransaction(version)` in `UserTransactionsTable` once the indexer query includes the columns the cells need | `useGetUserTransactionVersions.ts`, `useGetAccountAllTransactions.ts`, `TransactionsTable.tsx` | Medium |
| C2 | Replace `useEffect + getPrice()` in `BalanceCard` with `useGetPrice("aptos")` | `BalanceCard.tsx` | Trivial |
| C3 | Coalesce all `["ledgerInfo", networkValue]` consumers to a single shared hook with the longest needed `refetchInterval` and `refetchOnWindowFocus: false`. Document the chosen interval in `CACHING.md`. | `useGetTPS.ts`, `useGetMostRecentBlocks.ts`, `AllTransactions.tsx`, `TotalTransactions.tsx` | Small |
| C4 | Lengthen `defaultPreloadStaleTime` and consider `preload: false` on list routes | `app/router.tsx`, list route files | Small |
| C5 | Defer `useAccountHasConfidentialStores` to row hover / tab interaction, or replace with one indexer query | `useAccountHasConfidentialStores.ts`, `CoinsTab.tsx` | Small–Medium |
| C6 | Move `useGetValidators` operator patch fetch to an indexer query | `useGetValidators.ts` | Medium |
| C7 | CSV export: use `client.getTransactions({start, limit: 100})` instead of `getTransaction(version)` per call | `AccountAllTransactions.tsx` | Small |
| C8 | Cache search-probe results into React Query, not just `localStorage`, so the subsequent route navigation reuses them | `SearchWithResults.tsx`, `searchUtils.ts` | Small |
| C9 | Introduce `useViewFunctions` to batch parallel view calls into one indexer round-trip | `useViewFunction.ts`, callers under `app/api/hooks/useGet*` | Medium |
| C10 | Store ANS lookups under a stable query key and prefetch them in batches when an account page renders multiple addresses (`TransactionsTable`, `Validators`) | `useGetANS.ts`, callers | Medium |
| C11 | Pause `refetchInterval` when the document is hidden (`document.visibilityState`) for the TPS pill and ledger-info pollers | `useGetTPS.ts`, `AllTransactions.tsx`, `TotalTransactions.tsx` | Small |
| C12 | Set `refetchOnWindowFocus: false` globally and opt in per-hook for the few that actually need it; today the global default refetches *every* query on tab focus | `app/router.tsx`, hook overrides | Small |

### Note on global `refetchOnWindowFocus`

`createQueryClient()` in `app/router.tsx` sets `refetchOnWindowFocus: true` as
the default. That means when a user alt-tabs back to the explorer, **every
non-overridden query refetches simultaneously** — a single tab switch can
trigger dozens of API calls. Most hooks correctly override this to `false`,
but many do not (see the *global default* column in `CACHING.md`). Flipping
the global default to `false` and opting *in* per-hook is the safer policy
and a clear win for rate-limit budgets.

---

## 3. Server-side reductions (Netlify SSR + Functions)

These move calls from "N users × M requests" to "1 server × M requests, cached".

### S1. Route loaders for every list/detail page

`account.$address.$tab.tsx`, `txn.$txnHashOrVersion.$tab.tsx`, and
`block.$height.$tab.tsx` already pre-fetch their primary query inside the
TanStack Start `loader`. Replicate that pattern in:

- `transactions.tsx` → prefetch `transactionsQueryOptions` and `getLedgerInfo`
- `blocks.tsx` → prefetch the recent-blocks list via `getRecentBlocks`
- `validators.tsx`, `validators.$tab.tsx`, `validators-enhanced.tsx` → prefetch validator stats + ValidatorSet
- `coin.$struct.tsx`, `coin.$struct.$tab.tsx` → prefetch coin metadata + supply
- `fungible_asset.$address.*` → prefetch FA metadata + supply
- `token.$tokenId.*` → prefetch token data
- `object.$address.*` → prefetch object resource + account resources
- `validator.$address.tsx` → prefetch ValidatorSet + per-validator pool resource
- `analytics.tsx` → prefetch analytics JSON

For each, `queryClient.ensureQueryData(...)` inside the loader will:

- Run on the server during SSR (no user IP involved upstream).
- Populate the per-request `QueryClient` so the hydrated browser does **not**
  re-fetch immediately.
- Be coalesced across simultaneous users by Netlify's CDN once `s-maxage` is
  set (see S3 below).

### S2. Move CoinGecko behind a Netlify Function

Replace direct `fetch("https://api.coingecko.com/...")` calls (in
`useGetPrice.ts` and `useGetCoinMarketData.ts`) with a Netlify Function:

```
GET /api/coingecko/price?ids=aptos
GET /api/coingecko/markets?ids=aptos,ethereum,bitcoin,...
```

The function:

- Calls CoinGecko once per `(endpoint, ids)` combination.
- Returns `Cache-Control: public, s-maxage=600, stale-while-revalidate=3600`
  so Netlify's CDN serves repeat requests for free.
- Optionally uses a CoinGecko Pro API key from a `COINGECKO_API_KEY` secret
  (a real product investment, but it removes the entire free-tier rate limit
  question for the explorer).

CoinGecko's free tier rate limit (~10–50 req/min) is currently a per-user
limit — i.e. if the explorer is popular, **all** users start failing the
30-min stale window at the same time. Putting it behind a CDN-fronted
function changes that to "the explorer makes ~6 requests per hour, total,
regardless of traffic."

### S3. Cache-Control hardening on existing SSR routes

In `getSsrCacheControl`:

- Bump `/coin/*`, `/fungible_asset/*`, `/token/*` to `s-maxage=300, stale-while-revalidate=3600`
  (these change rarely once published).
- Bump `/validator/*` to `s-maxage=300, stale-while-revalidate=1800`.
- Once recommendation #2 is shipped, bump `/blocks` and `/validators` to
  `s-maxage=120` (server pre-fetches the data, so the HTML doesn't need to be
  fresher than that).
- Leave `/` and `/transactions` at the current `s-maxage=15` (they show
  always-changing data and are the most visited pages).

### S4. Per-version REST proxy with permanent edge cache

Add a `/api/txn/:hashOrVersion` Netlify Function that proxies the v1 REST
`/v1/transactions/by_version/:n` and `/v1/transactions/by_hash/:h` endpoints,
attaches the server-side API key, and returns
`Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`.
Confirmed transactions are immutable, so this cache is safe.

When the indexer fan-out fix (C1) is shipped, this is rarely needed for the
table view but is still valuable for the `/txn/:hash` detail page if multiple
users open the same shared link.

### S5. Indexer GraphQL pass-through with short cache

Some indexer queries (e.g. `account_transactions`, `current_fungible_asset_balances`)
are stable for ~5 s and viewed by many users. A `/api/indexer` POST function
that hashes the query+variables to a cache key and returns
`Cache-Control: public, s-maxage=5, stale-while-revalidate=30` would coalesce
the common queries across users.

This is the highest-leverage server-side change for indexer rate limits
specifically.

---

## 4. Defensive / observability improvements

Even after all the above, occasional 429s are inevitable. These changes make
them less user-visible and more diagnosable:

| # | Item | File(s) |
|---|---|---|
| D1 | Honor `Retry-After` headers from 429 responses (currently noted as a TODO in `RATE_LIMITING.md` § "Future Enhancements") | `app/api/client.ts`, `withResponseError` |
| D2 | Distinguish "I rate-limited the explorer" (gateway 429) vs "my own API key override is rate-limited" (settings API key) in `RateLimitDrawer` messaging | `app/components/RateLimitDrawer.tsx` |
| D3 | Add a build-time check that warns when a hook does not set `refetchOnWindowFocus` explicitly | `pnpm lint` script / a small custom rule |
| D4 | Emit a metric (GTM event) when `emitRateLimit()` fires, so production rate-limit frequency is observable, not anecdotal | `app/context/rate-limit/rateLimitEvents.ts` |
| D5 | Drift-test that ensures no future `useViewFunction` call is rendered N times in a list (a static-analysis rule against `useQueries({ queries: ... })` with growing array length, and against `array.map(... useFoo(...) ...)` patterns) | new vitest test under `app/api/hooks/` |

---

## 5. Proposed implementation order

1. **C2** (BalanceCard → `useGetPrice`) — one-line change, ships independently.
2. **C12 + C11** (flip `refetchOnWindowFocus` default, pause on hidden tabs)
   — global change, well-covered by existing CI.
3. **C3** (consolidate ledger-info pollers).
4. **C4** (preload tuning).
5. **C7** (CSV export uses `getTransactions(batch)`).
6. **S1** (route loaders for the rest of the routes).
7. **S2** (CoinGecko Netlify Function with CDN cache).
8. **C1** (indexer transactions query returns row columns; drop per-row REST fan-out).
9. **C5 + C6** (de-fan-out confidential stores + validator operators).
10. **S3 + S4 + S5** (extend SSR cache + add Netlify proxy functions).
11. **D1–D4** (observability + retry hardening).

Each step is independently shippable and reversible. The first five are
client-only, leave the rest of the system unchanged, and should reduce
per-visit upstream traffic by an estimated 40–60% on the most-trafficked
routes. Steps 6–10 are larger but transform per-user rate-limit costs into
amortized CDN cost.

---

## 6. Cross-references

- [`RATE_LIMITING.md`](../RATE_LIMITING.md) — current rate-limit utility, retry
  policy, React Query integration.
- [`CACHING.md`](../CACHING.md) — every cache / polling interval in the app.
- [`CONTEXT_OPTIMIZATION.md`](../CONTEXT_OPTIMIZATION.md) — separately reduces
  unnecessary re-renders (which in turn reduces accidental re-fetches).
- [`docs/FEATURES_SPECIFICATION.md`](FEATURES_SPECIFICATION.md) — when
  shipping any of the changes above, verify the affected `FEAT-*` IDs (most
  notably `FEAT-TRANSACTIONS-*`, `FEAT-ACCOUNT-*`, `FEAT-VALIDATORS-*`,
  `FEAT-COIN-*`) still pass.
- `app/router.tsx`, `app/ssr.tsx`, `netlify.toml` — the three files where the
  global request behavior lives. Most changes above land in one of these
  three.
