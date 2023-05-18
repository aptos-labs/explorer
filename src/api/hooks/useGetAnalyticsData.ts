import {useEffect, useState} from "react";
import {defaultNetworkName} from "../../constants";
import {useGlobalState} from "../../global-config/GlobalConfig";

export const ANALYTICS_DATA_URL =
  "https://storage.googleapis.com/aptos-mainnet/explorer/chain_stats_v2.json?cache-version=0";

export type AnalyticsData = {
  daily_active_users: DailyActiveUserData[];
  daily_average_gas_unit_price: DailyAvgGasData[];
  daily_gas_from_user_transactions: DailyGasCostData[];
  daily_contract_deployers: DailyContractDeployerData[];
  daily_deployed_contracts: DailyContractData[];
  daily_max_tps_15_blocks: DailyPeakTPSData[];
  daily_new_accounts_created: DailyNewAccountData[];
  daily_user_transactions: DailyUserTxnData[];
  max_tps_15_blocks_in_past_30_days: {
    max_tps_15_blocks_in_past_30_days: number;
  }[];
};

export type DailyAnalyticsData =
  | DailyActiveUserData
  | DailyAvgGasData
  | DailyGasCostData
  | DailyContractDeployerData
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

export type DailyGasCostData = {
  gas_cost: string;
  date: string;
};

export type DailyContractDeployerData = {
  distinct_deployers: number;
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
        const response = await fetch(ANALYTICS_DATA_URL);
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
