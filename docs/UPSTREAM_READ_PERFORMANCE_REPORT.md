# Upstream Read-Performance Report — Indexer & API Changes Needed

> Audience: maintainers of the **Aptos indexer (Hasura GraphQL)**, the **Aptos
> Gateway / fullnode REST API**, the `@aptos-labs/ts-sdk`, and the operators of
> the public **`storage.googleapis.com/aptos-mainnet/explorer/*.json`** analytics
> pipeline.
>
> Goal: enumerate the upstream gaps that, today, force the explorer to issue
> more requests, larger requests, or more sequential requests than the data
> shape warrants. For each, describe the explorer-side workaround currently in
> place, the proposed upstream change, and the expected request-reduction
> impact once the change lands.
>
> This is the natural follow-up to
> [`docs/REQUEST_REDUCTION_REPORT.md`](REQUEST_REDUCTION_REPORT.md) — that
> report covers fixes the explorer can make on its own; this one covers fixes
> that have to happen upstream.
>
> Schema snapshots in this report were captured against
> `https://api.mainnet.aptoslabs.com/v1/graphql` (Hasura) and
> `https://api.mainnet.aptoslabs.com/v1` (REST) on the same day this document
> was written.

---

## 0. TL;DR — the four highest-leverage upstream changes

Ranked by `(estimated explorer-wide request reduction) × (engineering effort⁻¹)`.

| # | Change | Eliminates / reduces | Explorer surface that benefits today |
|---|---|---|---|
| 1 | **Add `success`, `gas_used`, `vm_status` (and ideally `events`/`payload`) to the indexer `user_transactions` table** | the per-row REST `GET /v1/transactions/by_version/<n>` fan-out the explorer batch-primes today (~25 calls per visible page → 0 calls if indexer can fully replace REST data) | `/transactions`, `/account/.../transactions`, every `UserTransactionsTable`, CSV export |
| 2 | **Expose a public `events` GraphQL table on the indexer** | the per-row REST fetch *just* to read transaction `events` for the token-transfer column; would also let the explorer build account-scoped activity feeds without REST | `/transactions`, `/account/.../coins`, transaction detail pages, FA/coin activity views |
| 3 | **Batched view-function REST endpoint (`POST /v1/views` with an array body)** | per-page parallel `POST /v1/view` storms for coin / FA / staking detail pages (5–10 view calls per page collapsing into 1) | `/coin/$struct`, `/fungible_asset/*`, `/validator/*`, account `Coins` tab confidential-store check |
| 4 | **`Retry-After` header on 429 responses + `Cache-Control: public, max-age=31536000, immutable` on confirmed-transaction / confirmed-block REST endpoints** | adaptive backoff (currently a guess), and a permanent CDN-friendly cache window for immutable resources so any proxy / browser can hold them forever | every retry-on-429 codepath; every `/txn/*`, `/block/*` re-share |

Hitting just items 1–3 above is expected to remove the **bulk of the
explorer's remaining client-side REST fan-out**. Item 4 is small but makes
intermediate caches dramatically more effective and removes the need for the
exponential-jitter retry policy that currently shows up in
[`RATE_LIMITING.md`](../RATE_LIMITING.md).

---

## 1. Indexer (Hasura GraphQL) schema gaps

### 1.1 `user_transactions` is missing the success/gas/events columns the explorer renders

**What the indexer exposes today** (snapshot from `__type(name: "user_transactions")`):

```
block_height, entry_function_contract_address,
entry_function_function_name, entry_function_id_str,
entry_function_module_name, epoch, expiration_timestamp_secs,
gas_unit_price, max_gas_amount, parent_signature_type, sender,
sequence_number, signature, timestamp, version
```

**What's missing that the transactions table needs**:

- `success: Boolean` — drives the ✓/✗ status indicator on every row.
- `gas_used: numeric` — drives the gas-cost column.
- `vm_status: String` (optional but nice) — currently fetched per row just to
  format the failure-reason tooltip.
- `payload: jsonb` — drives the function-call display and counterparty
  detection (currently parsed from `transaction.payload` REST field).
- `events: jsonb` or a joined `transaction_events` table — drives the token
  transfer display column.

**Explorer workaround today** (see commit
`perf(transactions): batch-prime per-row transaction REST fetches into one range call`
on this branch): the indexer returns just the `version` list, then the explorer
batch-fetches the whole range with one `GET /v1/transactions?start=X&limit=Y`
REST call and primes React Query's per-version cache. This collapses 20–25 REST
calls per page to 1 when the range is dense, but **doesn't help when the user
filter is sparse** (filter by entry function across a long version range) and
**always costs at least one REST call per page** even when the indexer query
itself was free.

**Recommended upstream change**:

1. Add the columns above (especially `success` and `gas_used`) to
   `user_transactions`.
2. Either expose `transaction_events` as its own table or attach an `events:
   jsonb` column to `user_transactions` for compatibility with REST shape.
3. Backfill historical data; or, if backfill is infeasible, expose a
   `success: Boolean!` and `gas_used: numeric` join from `transactions` /
   `processor_status` for new rows and let the explorer fall back to REST for
   older rows.

**Expected impact**: per-row REST calls on `/transactions`,
`/account/.../transactions`, every function-filtered view, **and** the CSV
export disappear entirely. The explorer's batch-priming hook
(`useBatchPrimeTransactionsByVersion`) can be removed.

---

### 1.2 No public `events` table at all on the production indexer

**Observation**: the production endpoint exposes
`fungible_asset_activities`, `token_activities_v2`,
`delegated_staking_activities`, `confidential_asset_activities`, and
`proposal_votes`, but **no general-purpose `events` table**. The Aptos
indexer codebase has one — it's just not in the public Hasura schema.

**Why the explorer cares**:

- Every account-page transactions tab and the global transactions list issues
  one REST call per row *primarily* to read `transaction.events` for the
  token-transfer display column
  (`app/pages/Transactions/Components/TokenTransferDisplay.tsx`).
- Every transaction detail page renders the **Events** tab from REST
  (`app/pages/Transaction/Tabs/Components/EventsTab.tsx` — there is no
  indexer alternative).
- Token transfer detection across mixed coin types (`0x1::coin::*` and FA
  `0x1::fungible_asset::*`) is currently done by parsing the raw event stream.

**Recommended upstream change**:

- Expose `events` as a public GraphQL table with at least
  `(transaction_version, sequence_number, type, key, data, account_address,
  event_index, transaction_block_height)`.
- Index on `(account_address)` and `(type)` so the explorer can stream a
  per-account event feed without round-tripping REST.

**Expected impact**: the token-transfer column on the transactions tables can
be derived from `fungible_asset_activities` and the new `events` table without
a per-row REST call, completing the work item 1.1 starts.

---

### 1.3 No `view` resolver

**Observation**: there is no GraphQL field on the production Hasura schema that
proxies an on-chain `view` function. Each `useViewFunction` in the explorer
maps 1:1 to a `POST /v1/view` REST request.

**Why the explorer cares**:

- Coin and FA detail pages issue ≥4 parallel view calls on mount (metadata,
  supply, paired FA/coin, staking rewards rate). Every additional view call is
  another REST request from the user's browser to the gateway.
- The account `Coins` tab issues one `has_confidential_store` view call per
  fungible asset (capped at 20 by the explorer). Already cached for 24 h after
  the round-trip
  (`app/api/hooks/useAccountHasConfidentialStores.ts`); first visit is still
  a 20-call fan-out per account.

**Recommended upstream change**:

- Either a Hasura action / GraphQL resolver that proxies `view` requests, or
  (preferably) a **batched REST endpoint** — see § 2.1.

---

### 1.4 `current_staking_pool_voter.operator_address` is available but underused

**Observation**: `current_staking_pool_voter` already exposes
`staking_pool_address` and `operator_address`. The explorer doesn't query
this table — it instead reads `0x1::stake::StakePool.operator_address` from
the chain when patching missing rows from the GCS stats JSON.

**Why the explorer cares**:

- `useGetValidators` fans out up to 150 `getAccountResource` REST calls
  when `validator_stats_v2.json` is empty (already mitigated by the new
  7-day `localStorage` cache on this branch — see `useGetValidators.ts`).

**Recommended upstream change**: none required on the indexer side — this
is **already available**, the explorer just needs to migrate to it. Filed
here so the explorer team picks it up as the natural successor to the
localStorage backup.

**Expected impact**: a single indexer GraphQL query replaces the fan-out
entirely, even on first visit when the localStorage cache is cold.

---

### 1.5 No batch transaction lookup by version list

**Observation**: the indexer supports `user_transactions(where: {version: {_in: [...]}})`,
but only for the small column set it exposes. For the full transaction body
(success, gas_used, events, payload) the explorer still has to hit REST per
version.

**Recommended upstream change**: once §§ 1.1 / 1.2 land, a single
`user_transactions(where: {version: {_in: $versions}})` will be enough.
Until then, the same shape on the **REST side** (see § 2.2) would also work.

---

### 1.6 `delegator_distinct_pool` already gates wallet→pool lookups (good)

**Observation**: the recent fix for the "Validators page minute-long load with
wallet connected" issue (already shipped — see `CHANGELOG.md`) uses
`delegator_distinct_pool` to gate `get_stake` view calls to just the pools the
connected wallet has positions in. This is the **template** the rest of the
explorer should follow: ask the indexer first, hit the chain only for the
delta.

**No upstream change needed**. Documented here so future indexer teams
preserve this table.

---

## 2. REST API gaps

### 2.1 No batched view-function endpoint

**Observation**: `POST /v1/view` accepts a single view-function payload per
request. There is no `POST /v1/views` (plural) that takes an array of
payloads and returns an array of results.

**Why the explorer cares**:

- Coin / FA / validator / account detail pages each issue 3–10 parallel `view`
  requests on first paint.
- Even with React Query's per-key cache, the **first** visit always pays the
  full N-call cost — and N parallel requests from a single browser is enough
  to trip the per-IP rate limit on the public gateway.

**Recommended upstream change**: ship `POST /v1/views` that accepts an array
of `{function, type_arguments, arguments}` payloads, executes them at the
same `ledger_version`, and returns an array of `Result<MoveValue[]>` (so one
bad call in the batch doesn't fail the whole request).

**Expected impact**: 3–10 view calls per page → 1 REST request. With the
explorer's existing 5-minute view-function `staleTime`, this brings most
detail pages to ≤1 round-trip per session.

---

### 2.2 No "transactions by version list" REST endpoint

**Observation**: `GET /v1/transactions/by_version/<n>` fetches one
transaction. `GET /v1/transactions?start=X&limit=Y` fetches a sequential
range — including state-checkpoint and block-metadata transactions the
explorer doesn't want.

**Why the explorer cares**:

- The explorer's batch-prime hook (this PR) uses `GET /v1/transactions?start=X&limit=Y`
  to cover the user-transaction list returned by the indexer. It works because
  user transactions are dense on mainnet, but it pulls extra rows it discards.
  For sparse ranges (function filter, low-activity account) the explorer
  falls back to per-version REST.
- CSV export does the same.

**Recommended upstream change** *(any one of these would work)*:

- `POST /v1/transactions/by_versions` taking `{ versions: [n1, n2, ...] }`
  and returning the matching transactions in input order.
- A `versions` query parameter on the existing endpoint:
  `GET /v1/transactions?versions=1,2,3,...`.
- A `type=user_transaction` filter on the existing
  `GET /v1/transactions?start=X&limit=Y&type=user_transaction`.

**Expected impact**: removes the "pulls extra rows we discard" inefficiency
of the explorer's current batch hook, and lets the fallback per-version
mode also batch.

---

### 2.3 No `Retry-After` on 429 responses

**Observation**: rate-limited responses today carry
`{type: "rate_limited_exceeded", message: "..."}` but no
[`Retry-After`](https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.3)
header indicating *when* the client can retry.

**Why the explorer cares**:

- The explorer's `rateLimiter` utility (see
  [`RATE_LIMITING.md`](../RATE_LIMITING.md)) uses **exponential backoff with
  jitter** (1 s → 2 s → 4 s → 8 s → … capped at 30 s). This is a guess. It
  routinely under-shoots and re-trips the limit, or over-shoots and stalls
  the page for several seconds longer than necessary.
- The explorer already has a TODO in `RATE_LIMITING.md` § "Future
  Enhancements" → "Rate Limit Detection from Headers" to consume
  `Retry-After`; right now there's nothing to consume.

**Recommended upstream change**:

- Always send `Retry-After: <seconds>` (or `Retry-After: <HTTP-date>`) on
  every 429.
- Bonus: `X-Ratelimit-Limit`, `X-Ratelimit-Remaining`, `X-Ratelimit-Reset`
  on every response so clients can self-throttle *before* tripping the limit.

**Expected impact**: retries that recover on the first attempt instead of
the third → fewer total requests under load and a much better user
experience under partial degradation.

---

### 2.4 Immutable confirmed-state endpoints aren't marked immutable

**Observation**: the following endpoints serve data that is, by definition,
immutable once observed:

- `GET /v1/transactions/by_version/<n>` (committed transaction)
- `GET /v1/transactions/by_hash/<h>` (committed transaction)
- `GET /v1/blocks/by_height/<n>` (committed block)
- `GET /v1/blocks/by_height/<n>?with_transactions=true` (committed block + txns)
- `GET /v1/accounts/<addr>/resources?ledger_version=<n>` (historical state)

Today these come back with short `Cache-Control` or no `Cache-Control` at
all. CDNs / browsers / corporate proxies can't safely cache them long.

**Why the explorer cares**:

- The explorer's SSR layer sets long-`s-maxage` cache headers on the
  generated HTML for `/txn/*` and `/block/*` (see `app/ssr.tsx` on this
  branch — bumped to 24 h `s-maxage` with 30 d SWR). But the **data** that
  populates those pages on hydration still comes through React Query, which
  ultimately hits REST. If the REST endpoint advertised
  `Cache-Control: public, max-age=31536000, immutable`, every browser cache,
  every corporate proxy, and every reverse proxy along the way would hold
  the response for free — even for users who arrived at the page through
  a different route than SSR pre-fetch.

**Recommended upstream change**:

- For the endpoints above, emit
  `Cache-Control: public, max-age=31536000, immutable, stale-while-revalidate=604800`
  when (and only when) the response carries a confirmed `ledger_version` ≤
  the current ledger head.
- For ledger-info-style endpoints, keep short cache (it's by definition
  always-changing).

**Expected impact**: zero new requests on the explorer side (the change is
in cache headers, not in code), but a meaningful reduction in *total* requests
to the gateway from all clients that respect HTTP caching.

---

### 2.5 `Vary: Authorization` or per-key cacheability hints

**Observation**: the gateway accepts `Authorization: Bearer <api-key>` on every
request, but doesn't communicate via response headers whether two requests
with different `Authorization` values can share a cached response.

**Why the explorer cares**: the explorer lets users plug in their own
geomi.dev API key in `/settings`. Today every page they load issues separate
requests to the gateway even when the response would be byte-identical
between authenticated and unauthenticated callers (because the response is a
pure read of public chain state). A `Vary: Authorization` header would force
caches to keep them separate (current behavior); a missing `Vary` plus
explicit `Cache-Control: public` would let any cache share them.

**Recommended upstream change**: for read-only public endpoints (no
side-effects, no privacy-relevant body), emit `Cache-Control: public, ...`
**without** `Vary: Authorization`, so a CDN can serve one response to many
key-bearing users.

---

## 3. Upstream analytics / GCS pipeline gaps

### 3.1 `validator_stats_v2.json` (GCS) is missing `operator_address` for some rows

**Observation**: the explorer's `useGetValidators` patches rows whose
`operator_address` is empty, missing, or the zero address by fetching
`0x1::stake::StakePool` from the chain
(`isOperatorAddressMissing`). The mainnet stats file ships with ~10 such
rows on a typical day.

**Recommended upstream change**: fix the source pipeline (alloydb-proxy →
GCS) so every active validator's `operator_address` is populated. The data
exists in `current_staking_pool_voter` on the indexer — see § 1.4.

**Expected impact**: removes the residual ~10 on-chain calls per first visit
of `/validators` that the new explorer-side `localStorage` cache also
mitigates. With both fixes the operator fan-out reaches zero in steady
state.

---

### 3.2 `chain_stats_v2.json` should include live block height and TPS

**Observation**: the explorer hits the fullnode every ~15 s for
`getLedgerInfo` to get the latest block height (used by the TPS pill, the
home page's "TOTAL TRANSACTIONS" stat, and the recent-blocks loader). This
poll runs in every browser tab.

The GCS analytics JSON is updated periodically anyway — adding the latest
ledger version + block height + computed running TPS to it would let the
explorer serve that data from the CDN-cached JSON instead of polling the
gateway.

**Recommended upstream change**: extend the existing
`chain_stats_v2.json` shape with:

```json
{
  "latest": {
    "block_height": 12345678,
    "ledger_version": 9876543210,
    "epoch": 1234,
    "tps_15_blocks": 4321.5,
    "tps_1h_avg": 2100.7,
    "as_of": "2026-05-17T21:00:00Z"
  }
}
```

with the file's existing 1-hour update cadence. The explorer can fall back
to live ledger-info polling on networks that don't ship this file (devnet,
testnet) or when the file is more than `N` minutes stale.

**Expected impact**: the explorer can drop the 15-second `getLedgerInfo`
polling for `useGetTPS` + `TotalTransactions` on mainnet — replaced with
the same JSON it already loads once per `useGetAnalyticsData` session.

---

### 3.3 Public CDN-cached "recent blocks" endpoint

**Observation**: `/blocks` fetches 20 blocks (default) via 20 parallel
`getBlockByHeight` REST calls. Even with the new SSR pre-fetch on this
branch, the **server** still has to make 20 calls per cache miss.

**Recommended upstream change**: ship a `GET /v1/blocks?count=20` (or
similar) that returns the 20 most recent blocks in one response. Could
also be a `GET /v1/blocks?start=<height>&limit=20` mirroring the
`/v1/transactions` shape.

**Expected impact**: 20 REST calls per `/blocks` cache miss → 1.

---

## 4. SDK improvements

### 4.1 `@aptos-labs/ts-sdk` doesn't expose request batching

**Observation**: even if the gateway shipped batched REST endpoints
(§§ 2.1 / 2.2 / 3.3 above), the SDK currently has no batching API. The
explorer would have to bypass the SDK and hit REST directly to use them.

**Recommended upstream change**: when § 2.1 lands, add `aptos.views([req1,
req2, ...])` that maps onto `POST /v1/views`. When § 2.2 lands, add
`aptos.getTransactionsByVersions([v1, v2, ...])`. When § 3.3 lands, add
`aptos.getRecentBlocks(count)`.

---

### 4.2 SDK retry semantics don't surface `Retry-After`

**Observation**: even today, the SDK's auto-retry doesn't read
`Retry-After`. The explorer's `withResponseError` wrapper catches 429s but
can't see the header by the time the error reaches it.

**Recommended upstream change**: when § 2.3 lands, the SDK should respect
`Retry-After` (with a sane cap) and surface the delay value on the error
object so clients implementing their own backoff (like the explorer) can
pass through to it.

---

## 5. Indexer query patterns the explorer should adopt today

These are **not upstream changes** — they're items where the indexer already
has the data the explorer needs but the explorer uses REST instead. Filed
here for completeness so the explorer team picks them up in a future round.

| Migration | From | To |
|---|---|---|
| Validator operator address | `getAccountResource(0x1::stake::StakePool)` per pool | `current_staking_pool_voter(where: {staking_pool_address: {_in: [...]}})` |
| Account transaction success indicator (partial) | `getTransactionByVersion` per row | `fungible_asset_activities.is_transaction_success` for rows where any FA balance changed |
| FA metadata | `view(0x1::fungible_asset::metadata)` | `fungible_asset_metadata(where: {asset_type: {_eq: $address}})` (with `name`, `symbol`, `decimals`, `icon_uri`, `project_uri`, `supply_v2`, …) |
| FA supply | `view(0x1::fungible_asset::supply)` | `fungible_asset_metadata.supply_v2` |
| Token data | per-token REST | `current_token_datas_v2` |
| Delegation pool list | per-pool REST | `delegated_staking_pools` + `current_delegated_staking_pool_balances` |

The biggest win in this list is the **`fungible_asset_metadata` migration**:
it collapses `useGetFaMetadata` + `useGetFASupply` (two view calls today)
into one indexer query, which would in turn let the
`/fungible_asset/$address/$tab` route loader (already added in this PR)
pre-fetch the entire FA page in a single round-trip.

---

## 6. Acknowledgements & cross-references

- [`docs/REQUEST_REDUCTION_REPORT.md`](REQUEST_REDUCTION_REPORT.md) — the
  client-side counterpart to this report. Lists the fixes the explorer
  itself made / can make.
- [`RATE_LIMITING.md`](../RATE_LIMITING.md) — the existing exponential-backoff
  + queue-based rate-limit mitigation that this report would let us
  partially retire (once § 2.3 lands).
- [`CACHING.md`](../CACHING.md) — every React Query cache the explorer
  configures; updated in this PR with the new shared `useGetLedgerInfo`,
  `useBatchPrimeTransactionsByVersion`, and the persistent `localStorage`
  entries.
- `app/api/hooks/useGetValidators.ts` — the patch-from-chain workaround §§
  1.4 and 3.1 would let us delete.
- `app/api/hooks/useBatchPrimeTransactionsByVersion` (added this PR) — the
  workaround § 1.1 would let us delete.

---

## 7. Asks, in priority order

For the indexer team:

1. **Add `success`, `gas_used`, `vm_status`, `events`, `payload` to
   `user_transactions`** (or expose an `events` table) — § 1.1, § 1.2.
2. **Expose `current_staking_pool_voter` joins in documentation** so the
   explorer can migrate its operator lookup off-chain — § 1.4.

For the gateway / fullnode team:

3. **Ship `POST /v1/views` (batched view-function endpoint)** — § 2.1.
4. **Always emit `Retry-After` on 429 + `Cache-Control: …, immutable` on
   confirmed transaction/block endpoints** — §§ 2.3 / 2.4.
5. **Ship `GET /v1/blocks?count=N` or equivalent** — § 3.3.

For the analytics pipeline team:

6. **Fix `validator_stats_v2.json` so every row ships an `operator_address`** — § 3.1.
7. **Add `latest.{block_height, tps_15_blocks, tps_1h_avg}` to
   `chain_stats_v2.json`** — § 3.2.

For the SDK team:

8. **Wire batching APIs as the corresponding REST endpoints land** — § 4.1.
9. **Surface `Retry-After` on the error object** — § 4.2.
