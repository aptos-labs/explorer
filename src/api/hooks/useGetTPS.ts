import {useGlobalState} from "../../global-config/GlobalConfig";
import {useEffect, useState} from "react";
import {useQuery} from "react-query";
import {getLedgerInfo} from "..";
import {useGetTPSByBlockHeight} from "./useGetTPSByBlockHeight";
import {AnalyticsData, ANALYTICS_DATA_URL} from "./useGetAnalyticsData";

export function useGetTPS() {
  const [state, _] = useGlobalState();
  const [blockHeight, setBlockHeight] = useState<number | undefined>();
  const {tps} = useGetTPSByBlockHeight(blockHeight);

  const {data: ledgerData} = useQuery(
    ["ledgerInfo", state.network_value],
    () => getLedgerInfo(state.network_value),
    {refetchInterval: 10000},
  );
  const currentBlockHeight = ledgerData?.block_height;

  useEffect(() => {
    if (currentBlockHeight !== undefined) {
      setBlockHeight(parseInt(currentBlockHeight));
    }
  }, [currentBlockHeight, state]);

  return {tps};
}

export function useGetPeakTPS() {
  const [state, _] = useGlobalState();
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
    } else {
      setPeakTps(undefined);
    }
  }, [state]);

  return {peakTps};
}
