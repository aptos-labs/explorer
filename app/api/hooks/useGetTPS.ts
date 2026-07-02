import {useNetworkName} from "../../global-config";
import {useGetAnalyticsData} from "./useGetAnalyticsData";
import {useGetLedgerInfo} from "./useGetLedgerInfo";
import {useGetTPSByBlockHeight} from "./useGetTPSByBlockHeight";

export function useGetTPS() {
  const {data: ledgerData} = useGetLedgerInfo();
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
