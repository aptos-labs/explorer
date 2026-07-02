/**
 * Shared `getLedgerInfo` hook.
 *
 * Several places in the explorer want "the most recent ledger info":
 *   - `useGetTPS` (TPS pill in the header / analytics).
 *   - `AllTransactions` (computes the latest version for the paginator).
 *   - `useGetMostRecentBlocks` (computes the most recent block height).
 *   - `TotalTransactions` (the "TOTAL TRANSACTIONS" stat on the home page).
 *
 * They all key the same React Query entry as `["ledgerInfo", networkValue]`,
 * so React Query already coalesces the in-flight requests. But before this
 * hook existed each caller passed a different `refetchInterval` and
 * `refetchOnWindowFocus` value, which meant the *most aggressive* setting
 * (10 s polling) took effect whenever its component was mounted — even on
 * the home page, where 30 s is plenty.
 *
 * Routing all callers through this one hook fixes that: every consumer gets
 * the same polling cadence, the same staleTime, and `refetchOnWindowFocus`
 * defaults to false. `refetchInterval` is paused automatically by React
 * Query when the document is hidden (`refetchIntervalInBackground` is
 * `false` by default in TanStack Query v5).
 *
 * Pages that want more aggressive polling can pass an explicit
 * `refetchIntervalMs`; pages that want no polling at all can pass `false`.
 */

import {useQuery, type UseQueryResult} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {getLedgerInfo} from "..";
import type {ResponseError} from "../client";

export const DEFAULT_LEDGER_INFO_REFETCH_MS = 15 * 1000;
export const DEFAULT_LEDGER_INFO_STALE_MS = 10 * 1000;
export const DEFAULT_LEDGER_INFO_GC_MS = 60 * 1000;

export type UseGetLedgerInfoOptions = {
  /** Override the polling interval. Pass `false` to disable polling. */
  refetchIntervalMs?: number | false;
  /** Override the React Query `staleTime`. */
  staleTimeMs?: number;
  /** Override the React Query `gcTime`. */
  gcTimeMs?: number;
};

export function useGetLedgerInfo(
  options: UseGetLedgerInfoOptions = {},
): UseQueryResult<Types.IndexResponse, ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  return useQuery<Types.IndexResponse, ResponseError>({
    queryKey: ["ledgerInfo", networkValue],
    queryFn: () => getLedgerInfo(aptosClient),
    refetchInterval:
      options.refetchIntervalMs === false
        ? false
        : (options.refetchIntervalMs ?? DEFAULT_LEDGER_INFO_REFETCH_MS),
    staleTime: options.staleTimeMs ?? DEFAULT_LEDGER_INFO_STALE_MS,
    gcTime: options.gcTimeMs ?? DEFAULT_LEDGER_INFO_GC_MS,
    refetchOnWindowFocus: false,
  });
}
