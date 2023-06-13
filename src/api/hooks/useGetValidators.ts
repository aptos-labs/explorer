import {useGlobalState} from "../../global-config/GlobalConfig";
import {useEffect, useState} from "react";
import {useGetValidatorSet} from "./useGetValidatorSet";
import {Network, NetworkName} from "../../constants";
import {standardizeAddress} from "../../utils";

const MAINNET_VALIDATORS_DATA_URL =
  "https://storage.googleapis.com/aptos-mainnet/explorer/validator_stats_v2.json?cache-version=0";

const TESTNET_VALIDATORS_DATA_URL =
  "https://storage.googleapis.com/aptos-testnet/explorer/validator_stats_v2.json?cache-version=0";

const PREVIEWNET_VALIDATORS_DATA_URL =
  "https://aptos-analytics-data-previewnet.s3.amazonaws.com/validator_stats_v1.json";

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

function useGetValidatorsRawData(network: NetworkName) {
  const [state, _] = useGlobalState();
  const [validatorsRawData, setValidatorsRawData] = useState<ValidatorData[]>(
    [],
  );

  useEffect(() => {
    if (
      state.network_name === Network.MAINNET ||
      state.network_name === Network.TESTNET ||
      state.network_name === Network.PREVIEWNET
    ) {
      const getDataUrl = () => {
        switch (state.network_name) {
          case Network.MAINNET:
            return MAINNET_VALIDATORS_DATA_URL;
          case Network.PREVIEWNET:
            return PREVIEWNET_VALIDATORS_DATA_URL;
          default:
            return TESTNET_VALIDATORS_DATA_URL;
        }
      };
      const fetchData = async () => {
        const response = await fetch(getDataUrl());
        const rawData: ValidatorData[] = await response.json();
        setValidatorsRawData(
          rawData.map((validatorData) => {
            return {
              ...validatorData,
              owner_address: standardizeAddress(validatorData.owner_address),
              operator_address: standardizeAddress(
                validatorData.operator_address,
              ),
            };
          }),
        );
      };

      fetchData().catch((error) => {
        console.error("ERROR!", error, typeof error);
      });
    } else {
      setValidatorsRawData([]);
    }
  }, [state]);

  return {validatorsRawData};
}

export function useGetValidators(network?: NetworkName) {
  const [state] = useGlobalState();
  const {activeValidators} = useGetValidatorSet();
  const {validatorsRawData} = useGetValidatorsRawData(
    network ?? state.network_name,
  );

  const [validators, setValidators] = useState<ValidatorData[]>([]);

  useEffect(() => {
    if (activeValidators.length > 0 && validatorsRawData.length > 0) {
      const validatorsCopy = JSON.parse(JSON.stringify(validatorsRawData));

      validatorsCopy.forEach((validator: ValidatorData) => {
        const activeValidator = activeValidators.find(
          (activeValidator) => activeValidator.addr === validator.owner_address,
        );
        validator.voting_power = activeValidator?.voting_power ?? "0";
      });

      setValidators(validatorsCopy);
    }
  }, [activeValidators, validatorsRawData]);

  return {validators};
}
