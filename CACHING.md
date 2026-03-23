# Caching & Refresh Reference

A centralized reference for every cache duration, polling interval, and localStorage TTL in the Aptos Explorer. Keep this doc updated when adding or changing cache configurations.

---

## Global Defaults

Defined in `app/router.tsx` via `QueryClient.defaultOptions.queries`:

| Setting | Value | Notes |
|---|---|---|
| `staleTime` | 30 s | Data considered fresh for 30 seconds |
| `gcTime` | 5 min | Unused cache entries garbage-collected after 5 minutes |
| `refetchOnWindowFocus` | `true` | Re-fetches stale queries when the browser tab regains focus |
| `refetchOnMount` | `true` | Re-fetches stale queries when a component mounts |
| `retry` | 1 attempt | Retries once on failure; **no retry on 404** |
| `retryDelay` | 1–5 s exponential | `Math.min(1000 * (attemptIndex + 1), 5000)` |

Hooks marked **global default** in the tables below inherit these values. Hooks that explicitly set `staleTime` or `gcTime` override only those fields — all other settings still fall through to these defaults unless also overridden.

---

## React Query Cache Times

### Shared Query Options (`app/api/queries.ts`)

Used by route loaders **and** components. When a route loader pre-fetches data, these staleTime values determine whether the component re-fetches on mount.

| Query factory | staleTime | gcTime | Notes |
|---|---|---|---|
| `transactionsQueryOptions` | 10 s | *global default* | Latest 25 transactions |
| `ledgerInfoQueryOptions` | 1 s (configurable param) | *global default* | Caller can pass custom `staleTime` |
| `blocksQueryOptions` | 5 s | *global default* | Recent 20 blocks |
| `transactionQueryOptions` | 1 h | *global default* | Immutable — single transaction |
| `blockQueryOptions` | 1 h | *global default* | Immutable — single block |
| `accountInfoQueryOptions` | 30 s | *global default* | Account info |
| `accountResourcesQueryOptions` | 30 s | *global default* | Account resources |
| `accountModulesQueryOptions` | 1 min | *global default* | Modules change less frequently |
| `accountTransactionsQueryOptions` | 10 s | *global default* | Account transaction list |

### Ledger & TPS

| Hook | File | staleTime | gcTime | refetchInterval | Overrides | Notes |
|---|---|---|---|---|---|---|
| `useGetTPS` | `useGetTPS.ts` | 10 s | 30 s | 10 s | `refetchOnWindowFocus: false` | Real-time polling |
| `useGetPeakTPS` | `useGetTPS.ts` | — | — | — | — | Delegates to `useGetAnalyticsData` |
| `useGetTPSByBlockHeight` | `useGetTPSByBlockHeight.ts` | — | — | — | — | Delegates to `useGetBlockByHeight`; `TPS_FREQUENCY = 600` blocks |

### Blocks

| Hook | File | staleTime | gcTime | refetchInterval | Overrides | Notes |
|---|---|---|---|---|---|---|
| `useGetBlockByHeight` | `useGetBlock.ts` | 30 s | 10 min | 20 min | — | Confirmed blocks |
| `useGetBlockByVersion` | `useGetBlock.ts` | 1 h | 24 h | — | — | Immutable |
| `useGetMostRecentBlocks` (ledger) | `useGetMostRecentBlocks.ts` | 60 s | 5 min | — | `refetchOnWindowFocus: false` | Ledger info for block height |
| `useGetMostRecentBlocks` (blocks) | `useGetMostRecentBlocks.ts` | 60 s | 10 min | — | `refetchOnWindowFocus: false` | Indexer-based recent blocks |

### Transactions

| Hook | File | staleTime | gcTime | Overrides | Notes |
|---|---|---|---|---|---|
| `useGetTransaction` | `useGetTransaction.ts` | 1 h | 24 h | — | Immutable — long cache |
| `useGetAccountTransactions` | `useGetAccountTransactions.ts` | 30 s | 5 min | — | Dynamic list |

### Accounts

| Hook | File | staleTime | gcTime | Overrides | Notes |
|---|---|---|---|---|---|
| `useGetAccount` | `useGetAccount.ts` | 5 min | 1 h | `retry: false` | Semi-static account data |
| `useGetAccountResources` | `useGetAccountResources.ts` | 5 min | 1 h | `retry: false` | Semi-static |
| `useGetAccountResource` | `useGetAccountResource.ts` | 5 min | 1 h | `refetchOnWindowFocus: false` | Key delegation target for many hooks |
| `useGetAccountModules` | `useGetAccountModules.ts` | 5 min | 1 h | — | Module code |
| `useGetAccountModule` | `useGetAccountModule.ts` | *global default* | *global default* | `refetchOnWindowFocus: false` | Single module |
| `useGetAccountAPTBalance` | `useGetAccountAPTBalance.ts` | *global default* | *global default* | `retry: false` | APT balance |
| `useGetProfile` | `useGetProfile.ts` | *global default* | *global default* | `retry: false` | aptid.xyz profile data |

**Hooks delegating to `useGetAccountResource`** (inherit its 5 min / 1 h / no-refocus config):
- `useGetValidatorSet` — `0x1::stake::ValidatorSet`
- `useGetEpochTime` — `0x1::reconfiguration::Configuration` + `0x1::block::BlockResource`
- `useGetCoinMetadata` — coin info for a given coin type
- `useGetAccountPackages` — `0x1::code::PackageRegistry`

### Coins & Fungible Assets

| Hook | File | staleTime | gcTime | Overrides | Notes |
|---|---|---|---|---|---|
| `useGetCoinList` | `useGetCoinList.ts` | 1 h | 24 h | `refetchOnWindowFocus: false`, `retry: false` | Static metadata |
| `useGetCoinMarketData` | `useGetCoinMarketData.ts` | 30 min | 6 h | `refetchOnWindowFocus: false`, `refetchOnMount: false`, `retry: 1`, `retryDelay: 3 s` | CoinGecko prices |
| `useGetAccountCoins` | `useGetAccountCoins.ts` | 10 min | 1 h | `refetchOnWindowFocus: false`, `refetchOnMount: false` | FA balances |
| `useGetAccountCoinCount` | `useGetAccountCoins.ts` | 10 min | 1 h | `refetchOnWindowFocus: false`, `refetchOnMount: false` | Coin count |
| `useGetAllAccountCoins` | `useGetAccountCoins.ts` | 10 min | 1 h | `refetchOnWindowFocus: false`, `refetchOnMount: false` | All coins at once |
| `useGetFaMetadata` | `useGetFaMetadata.ts` | 5 min | 30 min | `refetchOnWindowFocus: false` | Via `useViewFunction` with overrides |
| `useGetCoinSupplyLimit` | `useGetCoinSupplyLimit.ts` | *global default* | *global default* | `refetchOnWindowFocus: false` | Via `useViewFunction` (no overrides) |
| `useGetFASupply` | `useGetFaSupply.ts` | *global default* | *global default* | `refetchOnWindowFocus: false` | Via `useViewFunction` (no overrides) |
| `useGetCoinPairedFa` | `useGetCoinPairedFa.ts` | *global default* | *global default* | `refetchOnWindowFocus: false` | Via `useViewFunction` (no overrides) |
| `useGetFaPairedCoin` | `useGetFaPairedCoin.ts` | *global default* | *global default* | — | Direct `useQuery`, no overrides |
| `useGetStakingRewardsRate` | `useGetStakingRewardsRate.ts` | *global default* | *global default* | `refetchOnWindowFocus: false` | Via `useViewFunction` (no overrides) |
| `useGetPrice` | `useGetPrice.ts` | *global default* | *global default* | — | Single coin price, no overrides |
| `useGetCoinActivities` | `useGetCoinActivities.ts` | *global default* | *global default* | — | No overrides |
| `useGetCoinHolders` | `useGetCoinHolders.ts` | *global default* | *global default* | — | No overrides |

### ANS (Aptos Name Service)

| Hook | File | staleTime | gcTime | localStorage TTL | Notes |
|---|---|---|---|---|---|
| `useGetNameFromAddress` | `useGetANS.ts` | 30 min | 1 h | 30 min | Also caches in localStorage |
| `useGetAddressFromName` | `useGetANS.ts` | 30 min | 1 h | — | Name → address |

**Constant**: `TTL = 30 * 60 * 1000` (30 min) in `useGetANS.ts`

### Validators

| Hook | File | staleTime | gcTime | Notes |
|---|---|---|---|---|
| `useGetValidatorsRawData` (internal) | `useGetValidators.ts` | 5 min | 30 min | Raw validator stats from GCS |
| `useGetValidators` | `useGetValidators.ts` | — | — | Composition hook: combines `useGetValidatorSet` + raw data via `useMemo` |
| `useGetValidatorSet` | `useGetValidatorSet.ts` | — | — | Delegates to `useGetAccountResource` (5 min / 1 h) |
| `useGetValidatorSetGeoData` | `useGetValidatorsGeoData.ts` | — | — | Delegates to `useGetValidators` |

**Constants** in `useGetValidators.ts`:
- `VALIDATOR_STATS_STALE_TIME = 5 * 60 * 1000` (5 min)
- `VALIDATOR_STATS_GC_TIME = 30 * 60 * 1000` (30 min)

### Analytics

| Hook | File | staleTime | gcTime | Overrides | Notes |
|---|---|---|---|---|---|
| `useGetAnalyticsData` | `useGetAnalyticsData.ts` | 10 min | 1 h | `refetchOnWindowFocus: false`, `refetchOnMount: false`, `retry: 1` | GCS JSON |
| `useGetFullnodeCount` | `useGetFullnodeCount.ts` | — | — | — | Delegates to `useGetAnalyticsData` |

**Constants** in `useGetAnalyticsData.ts`:
- `ANALYTICS_DATA_STALE_TIME = 10 * 60 * 1000` (10 min)
- `ANALYTICS_DATA_GC_TIME = 60 * 60 * 1000` (1 h)

### Network & Chain IDs

| Hook / Function | File | staleTime | gcTime | localStorage TTL | Notes |
|---|---|---|---|---|---|
| `useGetChainIdAndCache` | `useGetNetworkChainIds.ts` | 1 h | 1 h | 1 h | `refetchOnWindowFocus: false`, `refetchOnMount: false` |
| `useGetChainIdCached` (plain function) | `useGetNetworkChainIds.ts` | — | — | — | Not a React Query hook; reads localStorage directly |

**Constant**: `TTL = 3600000` (1 h) in `useGetNetworkChainIds.ts`

### Table Items (Indexer)

| Hook | File | staleTime | gcTime | Notes |
|---|---|---|---|---|
| `useGetTableItemsData` | `useGetTableItemData.ts` | `Infinity` | 24 h | Immutable table data — never re-fetched |
| `useGetTableItemsMetadata` | `useGetTableItemData.ts` | `Infinity` | 24 h | Immutable table metadata — never re-fetched |

### Tokens & NFTs

All token hooks use **global defaults** (30 s stale, 5 min gc) with no overrides:

| Hook | File |
|---|---|
| `useGetAccountTokens` | `useGetAccountTokens.ts` |
| `useGetAccountTokensCount` | `useGetAccountTokens.ts` |
| `useGetTokenData` | `useGetAccountTokens.ts` |
| `useGetTokenOwners` | `useGetAccountTokens.ts` |
| `useGetTokenActivities` | `useGetAccountTokens.ts` |
| `useGetTokenActivitiesCount` | `useGetAccountTokens.ts` |

### Delegations

Only one delegation hook has explicit cache config. The rest use **global defaults**:

| Hook | File | staleTime | gcTime | Notes |
|---|---|---|---|---|
| `useGetDelegatedStakingPoolList` | `delegations/useGetDelegatedStakingPoolList.ts` | 5 min | *global default* | Staking pool list |

**Hooks using global defaults**: `useGetDelegatedStakeOperationActivities`, `useGetDelegatedStaking`, `useGetDelegationNodeCommissionChange`, `useGetDelegationNodeInfo` (2 queries), `useGetDelegatorStakeInfo`, `useGetNumberOfDelegators`

### Indexer Transaction Queries

All indexer transaction hooks use **global defaults** with no overrides:

| Hook | File |
|---|---|
| `useGetAccountAllTransactionCount` | `useGetAccountAllTransactions.ts` |
| `useGetAccountAllTransactionVersions` | `useGetAccountAllTransactions.ts` |
| `useGetAllAccountTransactionVersions` | `useGetAccountAllTransactions.ts` |
| `useGetAccountTransactionsByFunctionCount` | `useGetAccountAllTransactions.ts` |
| `useGetAccountTransactionVersionsByFunction` | `useGetAccountAllTransactions.ts` |
| `useGetUserTransactionVersions` | `useGetUserTransactionVersions.ts` |
| `useGetUserTransactionsByFunctionCount` | `useGetUserTransactionVersions.ts` |
| `useGetUserTransactionVersionsByFunction` | `useGetUserTransactionVersions.ts` |

### View Functions

| Hook | File | staleTime | gcTime | Overrides | Notes |
|---|---|---|---|---|---|
| `useViewFunction` | `useViewFunction.ts` | configurable | configurable | `refetchOnWindowFocus: false` (always) | Generic; callers pass `staleTime` / `gcTime` / `enabled` via options |

---

## localStorage Cache

### Cache Manager (`app/utils/cacheManager.ts`)

| Constant | Value | Purpose |
|---|---|---|
| `CACHE_PREFIX` | `"aptos_explorer_cache_"` | Key prefix for all cached items |
| `MAX_CACHE_SIZE` | 5 MB | Total storage budget |
| `CACHE_VERSION` | `"1.0"` | Invalidates cache on version bump |

**Exported functions**:
- `setLocalStorageWithExpiry(key, value, ttl)` — store with TTL
- `getLocalStorageWithExpiry(key)` — retrieve; returns `null` if expired
- `removeLocalStorageItem(key)` — manual removal
- `clearCache()` — wipe all prefixed entries
- `getCacheStats()` — size and item count

**Internal helpers** (not exported):
- `cleanupExpiredItems()` — runs automatically on quota exceeded
- `evictOldestItems(targetSize)` — LRU eviction when full

### localStorage Entries

| Data | File | TTL | Key pattern |
|---|---|---|---|
| ANS names | `useGetANS.ts` | 30 min | ANS address → name mapping |
| Chain IDs | `useGetNetworkChainIds.ts` | 1 h | Per-network chain ID |

---

## Polling Intervals

| Source | File | Interval | Mechanism | Purpose |
|---|---|---|---|---|
| `useGetTPS` | `useGetTPS.ts` | 10 s | `refetchInterval` | Real-time TPS |
| `useGetBlockByHeight` | `useGetBlock.ts` | 20 min | `refetchInterval` | Background block refresh |
| `useLocalnetDetection` | `app/hooks/useLocalnetDetection.ts` | 30 s | `setInterval` | Check localnet availability (2 s timeout) |

---

## External API Rate Limits

### CoinGecko (`useGetCoinMarketData.ts`)

| Setting | Value | Notes |
|---|---|---|
| `BATCH_DELAY_MS` | 1.5 s | Delay between batch requests (~40 calls/min) |
| Batch size | 250 coins | CoinGecko per-request limit |
| Rate limit handling | 429 → 2× delay | Adaptive backoff |
| Retry | 1 attempt, 3 s delay | — |

---

## Cache Strategy by Data Type

| Data type | staleTime | gcTime | Refetch on focus | Rationale |
|---|---|---|---|---|
| **Immutable** (committed txns, confirmed blocks, table items) | 1 h – ∞ | 24 h | No | Never changes once confirmed |
| **Semi-static** (accounts, resources, modules) | 5–10 min | 1 h | Varies | Changes infrequently |
| **Dynamic** (TPS, recent blocks, ledger) | 5–30 s | 30 s – 5 min | No | Needs frequent refresh |
| **Metadata** (coins, ANS, FA) | 5 min – 1 h | 30 min – 24 h | No | Rarely changes |
| **Analytics** (GCS JSON) | 10 min | 1 h | No | Updated periodically server-side |
| **Pricing** (CoinGecko) | 30 min | 6 h | No | Rate-limited external API |
| **Indexer queries** (txn versions, counts) | *global default* (30 s) | *global default* (5 min) | Yes | Frequently changing data |

---

## Conditional Cache Behavior

Some hooks disable themselves based on network:

| Hook | Condition | Behavior |
|---|---|---|
| `useGetCoinList` | testnet / devnet | Uses only hardcoded coins |
| `useGetCoinMarketData` | Not mainnet **or** empty coin list | `enabled: false` |
| `useGetValidators` | Not mainnet / testnet | `enabled: false` |
| `useGetAnalyticsData` | Not mainnet | `enabled: false` |
| `useGetANS` | Invalid network or address | Returns `null` immediately |
| `useGetChainIdAndCache` | Non-local network | Caches to localStorage |

---

## Maintenance

When adding or changing a cache time:

1. Update the relevant table in this doc
2. If you add a new `setLocalStorageWithExpiry` call, add it to the **localStorage Entries** table
3. If you add a new `refetchInterval` or `setInterval`, add it to the **Polling Intervals** table
4. If a hook delegates to another hook, list it in the delegation section rather than duplicating cache values
5. Run `pnpm lint` to verify no regressions
