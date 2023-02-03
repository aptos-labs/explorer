import {useGlobalState} from "../../GlobalState";
import {useEffect, useState} from "react";
import {useGetValidatorSet} from "./useGetValidatorSet";
import {Network, NetworkName} from "../../constants";

const MAINNET_VALIDATORS_DATA_URL =
  "https://aptos-analytics-data-mainnet.s3.amazonaws.com/validator_stats_v1.json";

const TESTNET_VALIDATORS_DATA_URL =
  "https://aptos-analytics-data-testnet.s3.amazonaws.com/validator_stats_v1.json";

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
      state.network_name === Network.TESTNET
    ) {
      const fetchData = async () => {
        const response = await fetch(
          network === Network.MAINNET
            ? MAINNET_VALIDATORS_DATA_URL
            : TESTNET_VALIDATORS_DATA_URL,
        );
        const data = await response.json();
        setValidatorsRawData(data);
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
  const {activeValidators} = useGetValidatorSet();
  const {validatorsRawData} = useGetValidatorsRawData(
    network ?? Network.MAINNET,
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
