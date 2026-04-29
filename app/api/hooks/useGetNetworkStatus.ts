import {useQuery} from "@tanstack/react-query";
import {getApiKey, type NetworkName, networks} from "../../lib/constants";
import {
  frameworkReleaseFromGasFeatureVersion,
  maxBytecodeFormatVersionFromFlags,
} from "../../utils/aptosDeploymentVersions";
import {decodeFeatureBitmap} from "./aptosFeatureFlags";

export type NetworkStatus = {
  healthy: boolean;
  epoch: string;
  blockHeight: string;
  ledgerVersion: string;
  chainId: string;
  /** Aptos node software git commit hash from `GET /v1/` `git_hash`. */
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
  /**
   * Blockchain protocol major version (`0x1::version::Version.major`) — unrelated to
   * framework semver; kept for diagnostics next to the framework release.
   */
  protocolMajorVersion: number | null;
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

  const [gasResult, sResult, fResult, protoResult] = await Promise.allSettled([
    fetch(`${baseUrl}/accounts/0x1/resource/0x1::gas_schedule::GasScheduleV2`, {
      headers,
    }),
    fetch(`${baseUrl}/accounts/0x1/resource/0x1::stake::ValidatorSet`, {
      headers,
    }),
    fetch(`${baseUrl}/accounts/0x1/resource/0x1::features::Features`, {
      headers,
    }),
    fetch(`${baseUrl}/accounts/0x1/resource/0x1::version::Version`, {headers}),
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
  if (sResult.status === "fulfilled" && sResult.value.ok) {
    const s = (await sResult.value.json()) as {
      data: {active_validators: unknown[]};
    };
    validatorCount = s.data.active_validators.length;
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

  let protocolMajorVersion: number | null = null;
  if (protoResult.status === "fulfilled" && protoResult.value.ok) {
    const v = (await protoResult.value.json()) as {data: {major: string}};
    const parsedProtocolMajor = Number(v.data.major);
    protocolMajorVersion = Number.isFinite(parsedProtocolMajor)
      ? parsedProtocolMajor
      : null;
  }

  return {
    healthy: true,
    epoch: String(ledger.epoch),
    blockHeight: String(ledger.block_height),
    ledgerVersion: String(ledger.ledger_version),
    chainId: String(ledger.chain_id),
    gitHash: ledger.git_hash ?? null,
    frameworkRelease,
    gasFeatureVersion,
    bytecodeFormatVersion,
    protocolMajorVersion,
    validatorCount,
    enabledFeatures,
  };
}

export function useGetNetworkStatus(networkName: NetworkName) {
  return useQuery({
    queryKey: ["deployments", "networkStatus", networkName],
    queryFn: () => fetchNetworkStatus(networkName),
    staleTime: 60_000,
    retry: 1,
  });
}
