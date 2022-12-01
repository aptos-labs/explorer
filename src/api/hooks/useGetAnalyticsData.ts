import {useEffect, useState} from "react";
import {defaultNetworkName} from "../../constants";
import {useGlobalState} from "../../GlobalState";

const DATA_URL =
  "https://aptos-analytics-data-mainnet.s3.amazonaws.com/chain_stats_v2.json";

export type AnalyticsData = {
  daily_active_users: DailyActiveUserData[];
  daily_average_gas_unit_price: DailyAvgGasData[];
  daily_deployed_contracts: DailyContractData[];
  daily_max_tps_15_blocks: DailyPeakTPSData[];
  daily_new_accounts_created: DailyNewAccountData[];
  daily_user_transactions: DailyUserTxnData[];
};

export type DailyAnalyticsData =
  | DailyActiveUserData
  | DailyAvgGasData
  | DailyContractData
  | DailyPeakTPSData
  | DailyNewAccountData
  | DailyUserTxnData;

export type DailyActiveUserData = {
  daily_active_user_count: number;
  date: string;
};

export type DailyAvgGasData = {
  avg_gas_unit_price: string;
  date: string;
};

export type DailyContractData = {
  daily_contract_deployed: number;
  date: string;
};

export type DailyPeakTPSData = {
  max_tps_15_blocks: number;
  date: string;
};

export type DailyNewAccountData = {
  new_account_count: number;
  date: string;
};

export type DailyUserTxnData = {
  num_user_transactions: number;
  date: string;
};

export function useGetAnalyticsData() {
  const [state, _] = useGlobalState();
  const [data, setData] = useState<AnalyticsData>();

  useEffect(() => {
    if (state.network_name === defaultNetworkName) {
      const fetchData = async () => {
        const response = await fetch(DATA_URL);
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
