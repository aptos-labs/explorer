import {useGlobalState} from "../../global-config/GlobalConfig";
import {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {getLedgerInfo} from "..";
import {useGetTPSByBlockHeight} from "./useGetTPSByBlockHeight";
import {
  AnalyticsData,
  ANALYTICS_DATA_URL,
  PORTO_ANALYTICS_DATA_URL,
  BARDOCK_ANALYTICS_DATA_URL,
} from "./useGetAnalyticsData";

export function useGetTPS() {
  const [state] = useGlobalState();
  const [blockHeight, setBlockHeight] = useState<number | undefined>();
  const {tps} = useGetTPSByBlockHeight(blockHeight);

  const {data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", state.network_value],
    queryFn: () => getLedgerInfo(state.aptos_client),
    refetchInterval: 10000,
  });
  const currentBlockHeight = ledgerData?.block_height;

  useEffect(() => {
    if (currentBlockHeight !== undefined) {
      setBlockHeight(parseInt(currentBlockHeight));
    }
  }, [currentBlockHeight, state]);

  return {tps};
}

export function useGetPeakTPS() {
  const [state] = useGlobalState();
  const [peakTps, setPeakTps] = useState<number>();

  useEffect(() => {
    const showNetworks = ["mainnet", "testnet", "porto testnet"];
    if (showNetworks.includes(state.network_name)) {
      const fetchData = async () => {
        let ANALYTICS_DATA_URL_USE;
        switch (state.network_name) {
          case "testnet":
            ANALYTICS_DATA_URL_USE = ANALYTICS_DATA_URL;
            break;
          case "porto testnet":
            ANALYTICS_DATA_URL_USE = PORTO_ANALYTICS_DATA_URL;
            break;
          case "bardock testnet":
            ANALYTICS_DATA_URL_USE = BARDOCK_ANALYTICS_DATA_URL;
            break;
          default:
            ANALYTICS_DATA_URL_USE = ANALYTICS_DATA_URL;
            break;
        }

        const response = await fetch(ANALYTICS_DATA_URL_USE);
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
