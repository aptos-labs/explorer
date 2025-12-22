import { useEffect, useState } from "react";
import { useGetValidatorSet } from "./useGetValidatorSet";
import { useGlobalState } from "../../global-config/GlobalConfig";
// import {Network} from "../../constants";
// import {standardizeAddress} from "../../utils";

// const MAINNET_VALIDATORS_DATA_URL =
//   "https://storage.googleapis.com/aptos-mainnet/explorer/validator_stats_v2.json?cache-version=0";

// const TESTNET_VALIDATORS_DATA_URL =
//   "https://storage.googleapis.com/aptos-testnet/explorer/validator_stats_v2.json?cache-version=0";

// const PREVIEWNET_VALIDATORS_DATA_URL =
//   "https://aptos-analytics-data-previewnet.s3.amazonaws.com/validator_stats_v1.json";

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

// JSON validator stats loading is disabled until Movement has validator stats JSON files available
// This includes performance metrics: rewards_growth, last_epoch_performance, liveness, location_stats, etc.
const EMPTY_VALIDATORS_RAW_DATA: ValidatorData[] = [];

function useGetValidatorsRawData() {
  // Always return empty array - JSON stats loading is disabled
  // Using a constant to avoid creating new array reference on each render
  return { validatorsRawData: EMPTY_VALIDATORS_RAW_DATA };
}

export function useGetValidators() {
  const [state] = useGlobalState();
  const { activeValidators } = useGetValidatorSet();
  const { validatorsRawData } = useGetValidatorsRawData();

  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [hasJsonStats, setHasJsonStats] = useState<boolean>(false);

  useEffect(() => {
    if (activeValidators.length > 0 && validatorsRawData.length > 0) {
      // If we have JSON stats data, merge it with active validators
      const validatorsCopy = JSON.parse(JSON.stringify(validatorsRawData));

      validatorsCopy.forEach((validator: ValidatorData) => {
        const activeValidator = activeValidators.find(
          (activeValidator) => activeValidator.addr === validator.owner_address,
        );
        validator.voting_power = activeValidator?.voting_power ?? "0";
      });

      setValidators(validatorsCopy);
      setHasJsonStats(true);
    } else if (activeValidators.length > 0) {
      // Fallback: use active validators directly when JSON stats are not available
      // Fetch operator addresses from StakePool resources
      const fetchOperatorAddresses = async () => {
        const validatorsWithOperators: ValidatorData[] = await Promise.all(
          activeValidators.map(async (v) => {
            let operatorAddress = v.addr; // Default to owner address
            try {
              const response = await state.aptos_client.getAccountResource(
                v.addr,
                "0x1::stake::StakePool"
              );
              if (response?.data) {
                const data = response.data as { operator_address: string };
                operatorAddress = data.operator_address;
              }
            } catch (e) {
              // If fetch fails, use owner address as fallback
              console.warn(`Failed to fetch StakePool for ${v.addr}:`, e);
            }
            return {
              owner_address: v.addr,
              operator_address: operatorAddress,
              voting_power: v.voting_power,
              governance_voting_record: "",
              last_epoch: 0,
              last_epoch_performance: "",
              liveness: 0,
              rewards_growth: 0,
              apt_rewards_distributed: 0,
            };
          })
        );
        setValidators(validatorsWithOperators);
      };

      fetchOperatorAddresses();
      setHasJsonStats(false);
    }
  }, [activeValidators, validatorsRawData, state.aptos_client]);

  return { validators, hasJsonStats };
}
