import {useEffect, useState} from "react";
import {defaultNetworkName} from "../../constants";
import {useGlobalState} from "../../GlobalState";

export const SUPPLY_URL = "https://aptos-supply.dev.gcp.aptosdev.com/supply";

export type SupplyData = {
  blockchain_time_microseconds: number;
  current_circulating_supply: number;
  current_total_supply: number;
  ledger_version: number;
};

export function useGetSupply() {
  const [state, _] = useGlobalState();
  const [data, setData] = useState<SupplyData>();

  useEffect(() => {
    if (state.network_name === defaultNetworkName) {
      const fetchData = async () => {
        const response = await fetch(SUPPLY_URL);
        const data = await response.json();
        setData(data);
      };

      fetchData().catch((error) => {
        console.error("ERROR!", error, typeof error);
      });
    } else {
      setData(undefined);
    }
  }, [state]);

  return data;
}
