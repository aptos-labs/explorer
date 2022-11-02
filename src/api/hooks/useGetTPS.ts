import {useGlobalState} from "../../GlobalState";
import {useEffect, useState} from "react";
import {useQuery} from "react-query";
import {getLedgerInfo} from "..";
import {useGetTPSByBlockHeight} from "./useGetTPSByBlockHeight";

const PEAK_TPS_URL =
  "https://aptos-analytics-data-mainnet.s3.amazonaws.com/chain_stats.json";

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
        const response = await fetch(PEAK_TPS_URL);
        const data: {max_tps_15_blocks: number}[] = await response.json();
        const peakTps = data[0].max_tps_15_blocks;
        setPeakTps(peakTps);
      };

      fetchData().catch((error) => {
        console.error("ERROR!", error, typeof error);
      });
    }
  }, [state]);

  return {peakTps};
}
