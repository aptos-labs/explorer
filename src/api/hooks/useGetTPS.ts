import {useGlobalState} from "../../global-config/GlobalConfig";
import {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {getLedgerInfo} from "..";
import {useGetTPSByBlockHeight} from "./useGetTPSByBlockHeight";
import {AnalyticsData, ANALYTICS_DATA_URL} from "./useGetAnalyticsData";

export function useGetTPS() {
  const [state] = useGlobalState();

  const {data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", state.network_value],
    queryFn: () => getLedgerInfo(state.aptos_client),
    refetchInterval: 10000,
  });
  const currentBlockHeight = ledgerData?.block_height;
  const blockHeight =
    currentBlockHeight !== undefined ? parseInt(currentBlockHeight) : undefined;
  const {tps} = useGetTPSByBlockHeight(blockHeight);

  return {tps};
}

export function useGetPeakTPS() {
  const [state] = useGlobalState();
  const [peakTps, setPeakTps] = useState<number>();

  useEffect(() => {
    if (state.network_name === "mainnet") {
      const fetchData = async () => {
        const response = await fetch(ANALYTICS_DATA_URL);
        const data: AnalyticsData = await response.json();
        const peakTps =
          data.max_tps_15_blocks_in_past_30_days[0]
            .max_tps_15_blocks_in_past_30_days;
        setPeakTps(peakTps);
      };

      fetchData().catch((error) => {
        console.error("ERROR!", error, typeof error);
      });
    }
  }, [state.network_name]);

  return state.network_name === "mainnet" ? {peakTps} : {peakTps: undefined};
}
