import {useQueries} from "@tanstack/react-query";
import {useCallback, useMemo} from "react";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {isValidAccountAddress} from "../../pages/utils";
import {tryStandardizeAddress} from "../../utils";
import {
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
} from "../../utils/cacheManager";
import {view} from "../index";
import {parseConfidentialStoreBool} from "./confidentialAssetViews";

export type ConfidentialStoreQueryState = {
  pending: boolean;
  hasStore: boolean | undefined;
};

/**
 * Cache duration for has_confidential_store responses.
 *
 * At the time of writing, the only fungible asset on mainnet that meaningfully
 * uses confidential stores is AptosCoin, so for the vast majority of accounts
 * every per-FA check returns `false` and stays that way for as long as the
 * account never opts in. Caching for 24 hours per (user, FA) pair turns a
 * 20-view fan-out on every account-coins tab open into ~0 calls on repeat
 * visits.
 *
 * The jitter window (± `CONFIDENTIAL_STALE_JITTER_MS`) spreads the refresh
 * across users so a sudden flood of "stale by the same moment" refetches
 * doesn't hit the gateway at once.
 */
const CONFIDENTIAL_STALE_TIME = 24 * 60 * 60 * 1000; // 24 h base
const CONFIDENTIAL_STALE_JITTER_MS = 6 * 60 * 60 * 1000; // ±6 h
const CONFIDENTIAL_GC_TIME = 7 * 24 * 60 * 60 * 1000; // 7 d
const CONFIDENTIAL_LOCALSTORAGE_TTL = 24 * 60 * 60 * 1000; // 24 h
const CONFIDENTIAL_LOCALSTORAGE_PREFIX = "hasConfidentialStore";

/**
 * Deterministic jitter (in ms) keyed by the (user, FA, network) tuple. Using
 * a string hash keeps the jitter stable across renders for the same key,
 * which means React Query never sees a flapping `staleTime` value but two
 * different accounts on the same FA still pick *different* refresh moments.
 *
 * @internal Exported for unit tests.
 */
export function confidentialStoreStaleTime(
  user: string,
  fa: string,
  networkValue: string,
): number {
  const seed = `${user}|${fa}|${networkValue}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    // Bit-mix; deterministic and small (32-bit) — we only need a stable
    // 0..1 jitter, not a strong hash.
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  // Map signed 32-bit hash into [-1, 1], then scale by the jitter window.
  const jitterUnit = ((hash >>> 0) / 0xffffffff) * 2 - 1;
  return CONFIDENTIAL_STALE_TIME + jitterUnit * CONFIDENTIAL_STALE_JITTER_MS;
}

function confidentialStoreCacheKey(
  user: string,
  fa: string,
  networkValue: string,
): string {
  return `${CONFIDENTIAL_LOCALSTORAGE_PREFIX}:${networkValue}:${user}:${fa}`;
}

/**
 * Whether each FA metadata address has a `ConfidentialStore` for `userAddress`
 * (`0x1::confidential_asset::has_confidential_store`).
 */
export function useAccountHasConfidentialStores(
  userAddress: string,
  faMetadataAddresses: string[],
): {
  getConfidentialStore: (
    metadataAddress: string | null | undefined,
  ) => ConfidentialStoreQueryState;
} {
  const aptosClient = useAptosClient();
  const networkValue = useNetworkValue();
  const standardizedUser = tryStandardizeAddress(userAddress);

  // Cap at 20 to avoid a large fan-out of per-asset view calls that can trip
  // upstream rate limits on accounts with many different token types.
  const MAX_CONFIDENTIAL_QUERIES = 20;
  const dedupedFa = useMemo(
    () =>
      [...new Set(faMetadataAddresses)]
        .filter((a) => isValidAccountAddress(a))
        .slice(0, MAX_CONFIDENTIAL_QUERIES),
    [faMetadataAddresses],
  );

  const queryResults = useQueries({
    queries: dedupedFa.map((fa) => {
      const standardizedFa = tryStandardizeAddress(fa) ?? fa;
      const userKey = standardizedUser ?? userAddress;
      const lsKey = confidentialStoreCacheKey(
        userKey,
        standardizedFa,
        networkValue,
      );
      const request: Types.ViewRequest = {
        function: "0x1::confidential_asset::has_confidential_store",
        type_arguments: [],
        arguments: [userKey, standardizedFa],
      };
      return {
        queryKey: [
          "hasConfidentialStore",
          userKey,
          standardizedFa,
          networkValue,
        ],
        queryFn: async () => {
          // localStorage acts as a cross-session cache so users who close
          // the tab and come back the next day still avoid the view fan-out.
          // React Query owns the in-memory cache (staleTime / gcTime) for
          // the duration of the page visit.
          const cached = getLocalStorageWithExpiry<Types.MoveValue[]>(lsKey);
          if (cached) return cached;
          const result = await view(request, aptosClient);
          setLocalStorageWithExpiry(
            lsKey,
            result,
            CONFIDENTIAL_LOCALSTORAGE_TTL,
          );
          return result;
        },
        enabled: Boolean(standardizedUser) && isValidAccountAddress(fa),
        staleTime: confidentialStoreStaleTime(
          userKey,
          standardizedFa,
          networkValue,
        ),
        gcTime: CONFIDENTIAL_GC_TIME,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        select: (data: Types.MoveValue[]) => parseConfidentialStoreBool(data),
      };
    }),
  });

  const storeStateByFaKey = useMemo(() => {
    const m = new Map<string, ConfidentialStoreQueryState>();
    dedupedFa.forEach((fa, i) => {
      const q = queryResults[i];
      const key = tryStandardizeAddress(fa) ?? fa;
      m.set(key, {
        // Treat errors as pending so zero-balance rows aren't incorrectly
        // filtered out when the view call fails transiently.
        pending: q.isPending || q.isLoading || q.isError,
        hasStore: q.isError ? undefined : q.data,
      });
    });
    return m;
  }, [dedupedFa, queryResults]);

  const getConfidentialStore = useCallback(
    (
      metadataAddress: string | null | undefined,
    ): ConfidentialStoreQueryState => {
      if (!metadataAddress || !standardizedUser) {
        return {pending: false, hasStore: undefined};
      }
      const key = tryStandardizeAddress(metadataAddress) ?? metadataAddress;
      return storeStateByFaKey.get(key) ?? {pending: false, hasStore: false};
    },
    [storeStateByFaKey, standardizedUser],
  );

  return {getConfidentialStore};
}
