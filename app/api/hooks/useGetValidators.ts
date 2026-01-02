import {useNetworkName} from "../../global-config";
import {useEffect, useState} from "react";
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

function useGetValidatorsRawData() {
  const networkName = useNetworkName();
  const [validatorsRawData, setValidatorsRawData] = useState<ValidatorData[]>(
    [],
  );

  useEffect(() => {
    if (networkName === Network.MAINNET || networkName === Network.TESTNET) {
      const getDataUrl = () => {
        switch (networkName) {
          case Network.MAINNET:
            return MAINNET_VALIDATORS_DATA_URL;
          default:
            return TESTNET_VALIDATORS_DATA_URL;
        }
      };
      const fetchData = async () => {
        const response = await fetch(getDataUrl());
        const rawData: ValidatorData[] = await response.json();
        setValidatorsRawData(
          rawData.map((validatorData) => {
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
          }),
        );
      };

      fetchData().catch((error) => {
        console.error("ERROR!", error, typeof error);
      });
    }
  }, [networkName]);

  return networkName === Network.MAINNET || networkName === Network.TESTNET
    ? {validatorsRawData}
    : {validatorsRawData: []};
}

export function useGetValidators() {
  const {activeValidators} = useGetValidatorSet();
  const {validatorsRawData} = useGetValidatorsRawData();

  // Calculate validators during render instead of using useEffect
  let validators: ValidatorData[] = [];
  if (activeValidators.length > 0 && validatorsRawData.length > 0) {
    const validatorsCopy = JSON.parse(JSON.stringify(validatorsRawData));

    validatorsCopy.forEach((validator: ValidatorData) => {
      const activeValidator = activeValidators.find(
        (activeValidator) => activeValidator.addr === validator.owner_address,
      );
      validator.voting_power = activeValidator?.voting_power ?? "0";
    });

    validators = validatorsCopy;
  }

  return {validators};
}
