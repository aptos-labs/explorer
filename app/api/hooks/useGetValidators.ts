import {useQuery} from "@tanstack/react-query";
import {useMemo} from "react";
import {Network} from "../../constants";
import {useAptosClient, useNetworkName} from "../../global-config";
import {mapWithConcurrencyLimit} from "../../utils/mapWithConcurrencyLimit";
import {tryStandardizeAddress} from "../../utils";
import {getAccountResource} from "..";
import type {AptosClient} from "../legacyClient";
import {type Validator, useGetValidatorSet} from "./useGetValidatorSet";

// Cache version can be bumped via env var to force fresh data after deployments
const VALIDATOR_STATS_CACHE_VERSION =
  import.meta.env.VITE_VALIDATOR_STATS_CACHE_VERSION ?? "0";

const MAINNET_VALIDATORS_DATA_URL = `https://storage.googleapis.com/aptos-mainnet/explorer/validator_stats_v2.json?cache-version=${VALIDATOR_STATS_CACHE_VERSION}`;

const TESTNET_VALIDATORS_DATA_URL = `https://storage.googleapis.com/aptos-testnet/explorer/validator_stats_v2.json?cache-version=${VALIDATOR_STATS_CACHE_VERSION}`;

// Cache durations for validator stats
const VALIDATOR_STATS_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const VALIDATOR_STATS_GC_TIME = 30 * 60 * 1000; // 30 minutes

const STAKE_POOL_RESOURCE = "0x1::stake::StakePool";

const STAKE_POOL_OPERATOR_FETCH_CONCURRENCY = 12;

export interface ValidatorData {
  owner_address: string;
  operator_address: string;
  voting_power: string;
  governance_voting_record: string;
  last_epoch: number;
  last_epoch_performance: string;
  liveness: number;
  /** Omitted when stats JSON is unavailable (chain-only fallback rows). */
  rewards_growth?: number;
  location_stats?: GeoData;
  apt_rewards_distributed: number;
}

export interface GeoData {
  peer_id: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  region: string;
  epoch: number;
}

function getValidatorDataUrl(networkName: string): string | undefined {
  switch (networkName) {
    case Network.MAINNET:
      return MAINNET_VALIDATORS_DATA_URL;
    case Network.TESTNET:
      return TESTNET_VALIDATORS_DATA_URL;
    default:
      return undefined;
  }
}

function useGetValidatorsRawData() {
  const networkName = useNetworkName();
  const isEnabled =
    networkName === Network.MAINNET || networkName === Network.TESTNET;

  const query = useQuery<ValidatorData[]>({
    queryKey: ["validatorsRawData", networkName],
    queryFn: async () => {
      const url = getValidatorDataUrl(networkName);
      if (!url) {
        return [];
      }

      const response = await fetch(url);
      const rawData: ValidatorData[] = await response.json();

      return rawData.map((validatorData) => {
        const owner_address = tryStandardizeAddress(
          validatorData.owner_address,
        );
        const operator_address = tryStandardizeAddress(
          validatorData.operator_address,
        );

        // Standardize whichever side parsed cleanly. Leaving owner_address
        // unstandardized when only operator_address is missing would prevent
        // joining the row against the on-chain `0x1::stake::StakePool`
        // operator-address patch below.
        return {
          ...validatorData,
          owner_address: owner_address ?? validatorData.owner_address,
          operator_address: operator_address ?? validatorData.operator_address,
        };
      });
    },
    enabled: isEnabled,
    staleTime: VALIDATOR_STATS_STALE_TIME,
    gcTime: VALIDATOR_STATS_GC_TIME,
  });

  return {
    validatorsRawData: query.data ?? [],
    isValidatorStatsFetched: query.isFetched,
  };
}

/**
 * Returns true when a raw `operator_address` from the stats JSON should be
 * patched from the on-chain `0x1::stake::StakePool` resource. We treat the
 * value as missing if it cannot be standardized as an address, is the empty
 * string / null / undefined, or standardizes to the zero address — all of
 * which surface in the UI as a blank operator avatar.
 *
 * @internal Exported for unit tests.
 */
export function isOperatorAddressMissing(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== "string") return true;
  if (value.trim() === "") return true;
  const standardized = tryStandardizeAddress(value);
  if (!standardized) return true;
  return /^0x0+$/.test(standardized);
}

/**
 * Merges off-chain validator stats (when present) with on-chain voting power.
 * When the stats JSON is empty or unavailable, builds one row per active
 * validator from `0x1::stake::ValidatorSet` so the All Nodes table still works.
 *
 * `operatorByPool` (pool address → operator address, sourced from
 * `0x1::stake::StakePool`) is consulted in two cases:
 *   1. Chain-only fallback rows (no stats JSON): always preferred over the
 *      pool address as the operator column value.
 *   2. Stats-JSON rows whose `operator_address` is missing / invalid / zero
 *      (see {@link isOperatorAddressMissing}): patched so the operator column
 *      and avatar reflect the on-chain operator. Present operator addresses
 *      are never overwritten.
 *
 * @internal Exported for unit tests.
 */
export function buildValidatorsFromSources(
  activeValidators: Validator[],
  validatorsRawData: ValidatorData[],
  operatorByPool?: Readonly<Record<string, string>>,
): ValidatorData[] {
  if (activeValidators.length === 0) {
    return [];
  }

  if (validatorsRawData.length === 0) {
    return activeValidators.map((active) => ({
      owner_address: active.addr,
      operator_address: operatorByPool?.[active.addr] ?? active.addr,
      voting_power: active.voting_power,
      governance_voting_record: "",
      last_epoch: 0,
      last_epoch_performance: "",
      liveness: 0,
      rewards_growth: undefined,
      location_stats: undefined,
      apt_rewards_distributed: 0,
    }));
  }

  return validatorsRawData.map((validator) => {
    const activeValidator = activeValidators.find(
      (active) => active.addr === validator.owner_address,
    );
    const patchedOperator =
      isOperatorAddressMissing(validator.operator_address) &&
      operatorByPool?.[validator.owner_address]
        ? operatorByPool[validator.owner_address]
        : validator.operator_address;
    return {
      ...validator,
      operator_address: patchedOperator,
      voting_power: activeValidator?.voting_power ?? "0",
    };
  });
}

/**
 * Loads `0x1::stake::StakePool.operator_address` for each pool in
 * `poolAddresses`. Failed fetches and unstandardizable operator addresses are
 * omitted so callers can keep their existing value (or use the pool address
 * as a last-resort placeholder).
 *
 * @internal Exported for unit tests.
 */
export async function fetchStakePoolOperators(
  client: AptosClient,
  poolAddresses: readonly string[],
): Promise<Record<string, string>> {
  if (poolAddresses.length === 0) {
    return {};
  }

  const unique = Array.from(new Set(poolAddresses));

  const pairs = await mapWithConcurrencyLimit(
    unique,
    STAKE_POOL_OPERATOR_FETCH_CONCURRENCY,
    async (poolAddr) => {
      try {
        const resource = await getAccountResource(
          {address: poolAddr, resourceType: STAKE_POOL_RESOURCE},
          client,
        );
        const data = resource.data as {operator_address?: string};
        const operator = tryStandardizeAddress(data.operator_address);
        return [poolAddr, operator] as const;
      } catch {
        return [poolAddr, undefined] as const;
      }
    },
  );

  const out: Record<string, string> = {};
  for (const [pool, operator] of pairs) {
    if (operator) {
      out[pool] = operator;
    }
  }
  return out;
}

export function useGetValidators() {
  const networkName = useNetworkName();
  const aptosClient = useAptosClient();
  const {activeValidators} = useGetValidatorSet();
  const {validatorsRawData, isValidatorStatsFetched} =
    useGetValidatorsRawData();

  const isMainnetOrTestnet =
    networkName === Network.MAINNET || networkName === Network.TESTNET;

  // Pool addresses needing on-chain operator resolution:
  //   1. When the stats JSON is empty: every active validator (chain-only
  //      fallback used by the All Nodes table when the GCS bucket is empty).
  //   2. When the stats JSON is present but a row has a missing / invalid /
  //      zero operator address: just that row's owner address. Rows with a
  //      valid operator address are left untouched so we do not over-fetch.
  const poolsNeedingOperator = useMemo<string[]>(() => {
    if (!isMainnetOrTestnet || !isValidatorStatsFetched) return [];
    if (activeValidators.length === 0) return [];

    if (validatorsRawData.length === 0) {
      return activeValidators.map((v) => v.addr);
    }

    const missing: string[] = [];
    for (const row of validatorsRawData) {
      if (!isOperatorAddressMissing(row.operator_address)) continue;
      const owner = tryStandardizeAddress(row.owner_address);
      if (owner) missing.push(owner);
    }
    return missing;
  }, [
    activeValidators,
    validatorsRawData,
    isValidatorStatsFetched,
    isMainnetOrTestnet,
  ]);

  const poolsNeedingOperatorKey = useMemo(
    () => poolsNeedingOperator.join("|"),
    [poolsNeedingOperator],
  );

  const {data: operatorByPool} = useQuery({
    queryKey: [
      "validatorStakePoolOperators",
      networkName,
      poolsNeedingOperatorKey,
    ],
    queryFn: () => fetchStakePoolOperators(aptosClient, poolsNeedingOperator),
    enabled: poolsNeedingOperator.length > 0,
    staleTime: VALIDATOR_STATS_STALE_TIME,
    gcTime: VALIDATOR_STATS_GC_TIME,
  });

  // Memoize validators calculation to prevent unnecessary recomputation
  const validators = useMemo(
    () =>
      buildValidatorsFromSources(
        activeValidators,
        validatorsRawData,
        operatorByPool,
      ),
    [activeValidators, validatorsRawData, operatorByPool],
  );

  return {validators};
}
