import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useEffect, useMemo} from "react";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkValue} from "../../global-config";
import type {ResponseError} from "../client";
import {getTransaction, getTransactions} from "../index";

const TRANSACTION_STALE_TIME = 60 * 60 * 1000; // 1 hour
const TRANSACTION_GC_TIME = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Max ledger-version span we'll cover with one batched `getTransactions`
 * fetch. The endpoint returns every transaction (user + state-checkpoint +
 * block-metadata) in the range, so a sparse user-tx list with a wide span
 * pulls a lot of garbage. 200 is a pragmatic ceiling: at typical mainnet
 * density it covers the common ~25-row page in one round-trip.
 */
const BATCH_PRIME_MAX_SPAN = 200;

function transactionQueryKey(
  txnHashOrVersion: string,
  networkValue: string,
): readonly unknown[] {
  return ["transaction", {txnHashOrVersion}, networkValue];
}

export function useGetTransaction(txnHashOrVersion: string) {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  return useQuery<Types.Transaction, ResponseError>({
    queryKey: transactionQueryKey(txnHashOrVersion, networkValue),
    queryFn: () => getTransaction({txnHashOrVersion}, aptosClient),
    // Transaction data is static once confirmed - cache for 1 hour
    staleTime: TRANSACTION_STALE_TIME,
    gcTime: TRANSACTION_GC_TIME,
  });
}

/**
 * Compute the (start, limit) range that covers all `versions` with a single
 * batched `/v1/transactions` REST call, capped at {@link BATCH_PRIME_MAX_SPAN}.
 * Returns `null` when the range is too wide to batch (e.g. a function-filtered
 * page whose user-transactions are sparse).
 *
 * @internal Exported for unit tests.
 */
export function planTransactionsPrimeBatch(
  versions: number[],
): {start: number; limit: number} | null {
  if (versions.length === 0) return null;
  let min = versions[0];
  let max = versions[0];
  for (const v of versions) {
    if (typeof v !== "number" || !Number.isFinite(v)) return null;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = max - min + 1;
  if (span > BATCH_PRIME_MAX_SPAN || span <= 0) return null;
  return {start: min, limit: span};
}

/**
 * Pre-warm React Query's per-transaction cache for the entire `versions`
 * list using ONE batched `/v1/transactions?start=X&limit=Y` REST call,
 * instead of letting each `<UserTransactionRow>` fire its own
 * `useGetTransaction(version)`.
 *
 * On the typical /transactions page (25 sequential rows on mainnet) this
 * collapses ~25 REST calls per page render into 1 batched call. When the
 * version range is too wide (sparse filtered results), this hook becomes
 * a no-op and per-row fetches happen as before.
 *
 * The prime is a pure cache write: it never re-fetches a key that React
 * Query already has fresh, and it never overwrites a newer value with an
 * older one (versions are immutable).
 */
export function useBatchPrimeTransactionsByVersion(versions: number[]): void {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const queryClient = useQueryClient();

  // Stable string key so versions of the array with the same contents don't
  // trigger duplicate fetches (React's identity is array-not-content-aware).
  const versionsKey = useMemo(() => {
    if (versions.length === 0) return "";
    // Sort to make the key independent of incoming order, and join into a
    // string so two arrays with the same versions render as the same key.
    return [...versions].sort((a, b) => a - b).join(",");
  }, [versions]);

  useEffect(() => {
    if (!versionsKey) return;

    const plan = planTransactionsPrimeBatch(versions);
    if (!plan) return;

    // Skip the batch entirely if every version is already cached fresh.
    const anyMissing = versions.some((v) => {
      const state = queryClient.getQueryState(
        transactionQueryKey(v.toString(), networkValue),
      );
      // Cache miss, errored entry, or stale entry → worth re-priming.
      if (!state || state.status !== "success") return true;
      const updatedAt = state.dataUpdatedAt ?? 0;
      return Date.now() - updatedAt > TRANSACTION_STALE_TIME;
    });
    if (!anyMissing) return;

    let cancelled = false;
    (async () => {
      try {
        const txns = await getTransactions(
          {start: plan.start, limit: plan.limit},
          aptosClient,
        );
        if (cancelled) return;
        const wanted = new Set(versions.map((v) => v.toString()));
        for (const txn of txns) {
          if (!("version" in txn) || txn.version == null) continue;
          const versionStr = String(txn.version);
          if (!wanted.has(versionStr)) continue;
          queryClient.setQueryData(
            transactionQueryKey(versionStr, networkValue),
            txn,
          );
        }
      } catch {
        // Falls back to per-row `useGetTransaction` fetches; no need to
        // surface this since the page would otherwise have made those
        // individual calls anyway.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [versionsKey, versions, networkValue, aptosClient, queryClient]);
}
