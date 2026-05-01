import {useQuery} from "@tanstack/react-query";
import {getApiKey, type NetworkName, networks} from "../../lib/constants";
import {
  frameworkReleaseFromGasFeatureVersion,
  maxBytecodeFormatVersionFromFlags,
} from "../../utils/aptosDeploymentVersions";
import {
  extractAdvertisedHostnameFromAddressBlob,
  fetchGitHashFromAdvertisedHostname,
  mapWithConcurrency,
  modeGitHash,
  normalizeAptosCoreGitHash,
} from "../../utils/aptosValidatorAdvertisedHosts";
import {decodeFeatureBitmap} from "./aptosFeatureFlags";

/** Sample size + concurrency for probing validators' advertised REST endpoints. */
const VALIDATOR_GIT_HASH_SAMPLE = 12;
const VALIDATOR_PROBE_CONCURRENCY = 4;

export type NetworkStatus = {
  healthy: boolean;
  epoch: string;
  blockHeight: string;
  ledgerVersion: string;
  chainId: string;
  /**
   * `git_hash` from the configured Aptos API gateway / fullnode (`GET …/v1/`).
   * This reflects whichever node backs the explorer's REST URL, not an individual
   * validator.
   */
  fullnodeGitHash: string | null;
  /**
   * Representative `git_hash` for the active validator set: sampled from
   * on-chain `ValidatorSet` by probing a few operators' advertised hostnames
   * (see `network_addresses` / `fullnode_addresses` blobs) for `GET /v1/`.
   * `null` when we could not reach any sampled endpoint.
   */
  validatorSetGitHash: string | null;
  /**
   * @deprecated Use `fullnodeGitHash` (API endpoint) or `validatorSetGitHash`
   * (validator set). Kept as an alias of `fullnodeGitHash` for older consumers.
   */
  gitHash: string | null;
  /**
   * Mapped framework release train from `gasFeatureVersion` (e.g. `"1.43"`).
   * **`null`** when `gasFeatureVersion` is unknown **or** not yet listed in
   * `GAS_FEATURE_VERSION_TO_FRAMEWORK_RELEASE` — use `gasFeatureVersion` and show an
   * unmapped label in the UI when appropriate.
   */
  frameworkRelease: string | null;
  /**
   * Raw gas schedule feature version from chain — useful when the explorer's mapping
   * table is behind a new aptos-core release.
   */
  gasFeatureVersion: number | null;
  /** Highest Move bytecode format version enabled (from VM Binary Format v* feature flags). */
  bytecodeFormatVersion: number | null;
  validatorCount: number | null;
  /** Sorted list of enabled feature flag IDs from `0x1::features::Features`. */
  enabledFeatures: number[] | null;
};

export async function fetchNetworkStatus(
  networkName: NetworkName,
): Promise<NetworkStatus> {
  const baseUrl = networks[networkName];
  const apiKey = getApiKey(networkName);
  const headers: Record<string, string> = apiKey
    ? {Authorization: `Bearer ${apiKey}`}
    : {};

  const res = await fetch(`${baseUrl}/`, {headers});
  if (!res.ok) throw new Error(`Fullnode returned ${res.status}`);
  type LedgerInfo = {
    epoch: number | string;
    block_height: number | string;
    ledger_version: number | string;
    chain_id: number | string;
    git_hash?: string;
  };
  const ledger = (await res.json()) as LedgerInfo;

  const [gasResult, sResult, fResult] = await Promise.allSettled([
    fetch(`${baseUrl}/accounts/0x1/resource/0x1::gas_schedule::GasScheduleV2`, {
      headers,
    }),
    fetch(`${baseUrl}/accounts/0x1/resource/0x1::stake::ValidatorSet`, {
      headers,
    }),
    fetch(`${baseUrl}/accounts/0x1/resource/0x1::features::Features`, {
      headers,
    }),
  ]);

  let gasFeatureVersion: number | null = null;
  if (gasResult.status === "fulfilled" && gasResult.value.ok) {
    const g = (await gasResult.value.json()) as {
      data: {feature_version: string};
    };
    const parsed = Number(g.data.feature_version);
    gasFeatureVersion = Number.isFinite(parsed) ? parsed : null;
  }

  let frameworkRelease: string | null = null;
  if (gasFeatureVersion !== null) {
    frameworkRelease = frameworkReleaseFromGasFeatureVersion(gasFeatureVersion);
  }

  let validatorCount: number | null = null;
  let validatorSetGitHash: string | null = null;
  if (sResult.status === "fulfilled" && sResult.value.ok) {
    const s = (await sResult.value.json()) as {
      data: {
        active_validators: Array<{
          config?: {
            network_addresses?: string;
            fullnode_addresses?: string;
          };
        }>;
      };
    };
    validatorCount = s.data.active_validators.length;

    const hostnames = new Set<string>();
    for (const v of s.data.active_validators.slice(0, VALIDATOR_GIT_HASH_SAMPLE)) {
      const cfg = v.config;
      if (!cfg) continue;
      for (const key of [
        "network_addresses",
        "fullnode_addresses",
      ] as const) {
        const hex = cfg[key];
        if (typeof hex !== "string") continue;
        const host = extractAdvertisedHostnameFromAddressBlob(hex);
        if (host) hostnames.add(host);
      }
    }

    if (hostnames.size > 0) {
      const hashes = await mapWithConcurrency(
        [...hostnames],
        VALIDATOR_PROBE_CONCURRENCY,
        (hostname) => fetchGitHashFromAdvertisedHostname(hostname),
      );
      validatorSetGitHash = modeGitHash(hashes.filter((h): h is string => !!h));
    }
  }

  let enabledFeatures: number[] | null = null;
  if (fResult.status === "fulfilled" && fResult.value.ok) {
    const f = (await fResult.value.json()) as {data: {features: string}};
    enabledFeatures = decodeFeatureBitmap(f.data.features);
  }

  let bytecodeFormatVersion: number | null = null;
  if (enabledFeatures) {
    bytecodeFormatVersion = maxBytecodeFormatVersionFromFlags(enabledFeatures);
  }

  const fullnodeGitHash = normalizeAptosCoreGitHash(ledger.git_hash);

  return {
    healthy: true,
    epoch: String(ledger.epoch),
    blockHeight: String(ledger.block_height),
    ledgerVersion: String(ledger.ledger_version),
    chainId: String(ledger.chain_id),
    fullnodeGitHash,
    validatorSetGitHash,
    gitHash: fullnodeGitHash,
    frameworkRelease,
    gasFeatureVersion,
    bytecodeFormatVersion,
    validatorCount,
    enabledFeatures,
  };
}

export function useGetNetworkStatus(networkName: NetworkName) {
  return useQuery({
    queryKey: ["deployments", "networkStatus", "v2", networkName],
    queryFn: () => fetchNetworkStatus(networkName),
    // Validator probes hit third-party operator endpoints — avoid hammering them on rapid refetch.
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
