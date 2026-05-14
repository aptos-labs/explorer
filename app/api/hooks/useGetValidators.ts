import {useQuery} from "@tanstack/react-query";
import {useMemo} from "react";
import {Network} from "../../constants";
import {useNetworkName} from "../../global-config";
import {tryStandardizeAddress} from "../../utils";
import {type Validator, useGetValidatorSet} from "./useGetValidatorSet";

// Cache version can be bumped via env var to force fresh data after deployments
const VALIDATOR_STATS_CACHE_VERSION =
  import.meta.env.VITE_VALIDATOR_STATS_CACHE_VERSION ?? "0";

const MAINNET_VALIDATORS_DATA_URL = `https://storage.googleapis.com/aptos-mainnet/explorer/validator_stats_v2.json?cache-version=${VALIDATOR_STATS_CACHE_VERSION}`;

const TESTNET_VALIDATORS_DATA_URL = `https://storage.googleapis.com/aptos-testnet/explorer/validator_stats_v2.json?cache-version=${VALIDATOR_STATS_CACHE_VERSION}`;

// Cache durations for validator stats
const VALIDATOR_STATS_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const VALIDATOR_STATS_GC_TIME = 30 * 60 * 1000; // 30 minutes

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

  const {data: validatorsRawData = []} = useQuery<ValidatorData[]>({
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
        if (!owner_address || !operator_address) {
          return validatorData;
        }

        return {
          ...validatorData,
          owner_address,
          operator_address,
        };
      });
    },
    enabled: isEnabled,
    staleTime: VALIDATOR_STATS_STALE_TIME,
    gcTime: VALIDATOR_STATS_GC_TIME,
  });

  return {validatorsRawData};
}

/**
 * Merges off-chain validator stats (when present) with on-chain voting power.
 * When the stats JSON is empty or unavailable, builds one row per active
 * validator from `0x1::stake::ValidatorSet` so the All Nodes table still works.
 *
 * @internal Exported for unit tests.
 */
export function buildValidatorsFromSources(
  activeValidators: Validator[],
  validatorsRawData: ValidatorData[],
): ValidatorData[] {
  if (activeValidators.length === 0) {
    return [];
  }

  if (validatorsRawData.length === 0) {
    return activeValidators.map((active) => ({
      owner_address: active.addr,
      operator_address: active.addr,
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
    return {
      ...validator,
      voting_power: activeValidator?.voting_power ?? "0",
    };
  });
}

export function useGetValidators() {
  const {activeValidators} = useGetValidatorSet();
  const {validatorsRawData} = useGetValidatorsRawData();

  // Memoize validators calculation to prevent unnecessary recomputation
  const validators = useMemo(
    () => buildValidatorsFromSources(activeValidators, validatorsRawData),
    [activeValidators, validatorsRawData],
  );

  return {validators};
}
