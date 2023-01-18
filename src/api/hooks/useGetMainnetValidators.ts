import {useGlobalState} from "../../GlobalState";
import {useEffect, useState} from "react";

const MAINNET_VALIDATORS_DATA_URL =
  "https://aptos-analytics-data-mainnet.s3.amazonaws.com/validator_stats_v1.json";

export interface MainnetValidatorData {
  owner_address: string;
  operator_address: string;
  voting_power: string;
  governance_voting_record: string;
  last_epoch: number;
  last_epoch_performance: string;
  liveness: number;
  rewards_growth: number;
  location_stats: GeoData;
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

export function useGetMainnetValidators() {
  const [state, _] = useGlobalState();
  const [validators, setValidators] = useState<MainnetValidatorData[]>([]);

  useEffect(() => {
    if (state.network_name === "mainnet") {
      const fetchData = async () => {
        const response = await fetch(MAINNET_VALIDATORS_DATA_URL);
        const data = await response.json();
        setValidators(data);
      };

      fetchData().catch((error) => {
        console.error("ERROR!", error, typeof error);
      });
    } else {
      setValidators([]);
    }
  }, [state]);

  return {validators};
}
