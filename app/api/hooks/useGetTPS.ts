import {
  useNetworkValue,
  useAptosClient,
  useNetworkName,
} from "../../global-config";
import {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {getLedgerInfo} from "..";
import {useGetTPSByBlockHeight} from "./useGetTPSByBlockHeight";
import {AnalyticsData, ANALYTICS_DATA_URL} from "./useGetAnalyticsData";

export function useGetTPS() {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  const {data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", networkValue],
    queryFn: () => getLedgerInfo(aptosClient),
    refetchInterval: 10000,
    // Real-time data - no stale time, but keep in cache briefly
    staleTime: 0,
    gcTime: 30 * 1000, // Keep in cache for 30 seconds
  });
  const currentBlockHeight = ledgerData?.block_height;
  const blockHeight =
    currentBlockHeight !== undefined ? parseInt(currentBlockHeight) : undefined;
  const {tps} = useGetTPSByBlockHeight(blockHeight);

  return {tps};
}

export function useGetPeakTPS() {
  const networkName = useNetworkName();
  const [peakTps, setPeakTps] = useState<number>();

  useEffect(() => {
    if (networkName === "mainnet") {
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
  }, [networkName]);

  return networkName === "mainnet" ? {peakTps} : {peakTps: undefined};
}
