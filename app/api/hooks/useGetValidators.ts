import {useNetworkName} from "../../global-config";
import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {useGetValidatorSet} from "./useGetValidatorSet";
import {Network} from "../../constants";
import {tryStandardizeAddress} from "../../utils";

const MAINNET_VALIDATORS_DATA_URL =
  "https://storage.googleapis.com/aptos-mainnet/explorer/validator_stats_v2.json?cache-version=0";

const TESTNET_VALIDATORS_DATA_URL =
  "https://storage.googleapis.com/aptos-testnet/explorer/validator_stats_v2.json?cache-version=0";

export interface ValidatorData {
  owner_address: string;
  operator_address: string;
  voting_power: string;
  governance_voting_record: string;
  last_epoch: number;
  last_epoch_performance: string;
  liveness: number;
  rewards_growth: number;
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
    // Validator stats update periodically - cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  return {validatorsRawData};
}

export function useGetValidators() {
  const {activeValidators} = useGetValidatorSet();
  const {validatorsRawData} = useGetValidatorsRawData();

  // Memoize validators calculation to prevent unnecessary recomputation
  const validators = useMemo(() => {
    if (activeValidators.length === 0 || validatorsRawData.length === 0) {
      return [];
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
  }, [activeValidators, validatorsRawData]);

  return {validators};
}
