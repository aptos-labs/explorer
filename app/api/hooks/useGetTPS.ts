import {useQuery} from "@tanstack/react-query";
import {
  useAptosClient,
  useNetworkName,
  useNetworkValue,
} from "../../global-config";
import {getLedgerInfo} from "..";
import {useGetAnalyticsData} from "./useGetAnalyticsData";
import {useGetTPSByBlockHeight} from "./useGetTPSByBlockHeight";

export function useGetTPS() {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  const {data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", networkValue],
    queryFn: () => getLedgerInfo(aptosClient),
    refetchInterval: 1000,
    staleTime: 1000,
    gcTime: 30 * 1000, // Keep in cache for 30 seconds
    refetchOnWindowFocus: false,
  });
  const currentBlockHeight = ledgerData?.block_height;
  const blockHeight =
    currentBlockHeight !== undefined
      ? parseInt(currentBlockHeight, 10)
      : undefined;
  const {tps} = useGetTPSByBlockHeight(blockHeight);

  return {tps};
}

export function useGetPeakTPS() {
  const networkName = useNetworkName();
  const analyticsData = useGetAnalyticsData();

  const peakTps =
    networkName === "mainnet"
      ? analyticsData?.max_tps_15_blocks_in_past_30_days[0]
          ?.max_tps_15_blocks_in_past_30_days
      : undefined;

  return networkName === "mainnet" ? {peakTps} : {peakTps: undefined};
}
