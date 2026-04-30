import {useQuery} from "@tanstack/react-query";
import {fetchAptosFeatureFlagNamesFromUpstream} from "./aptosFeatureFlagsUpstream";

const QUERY_KEY = ["aptos-feature-flag-names-upstream"] as const;

/** Long stale time: enum names change rarely; jsDelivr caches aggressively. */
const STALE_MS = 24 * 60 * 60 * 1000;

/**
 * Resolved names for `FeatureFlag` variants from aptos-core source.
 * Merge with static `APTOS_FEATURE_FLAGS` in the UI — static entries win.
 */
export function useAptosFeatureFlagUpstreamNames() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAptosFeatureFlagNamesFromUpstream,
    staleTime: STALE_MS,
    gcTime: STALE_MS * 2,
    retry: 1,
  });
}
