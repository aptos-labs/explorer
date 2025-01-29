import {useGlobalState} from "../../global-config/GlobalConfig";
import {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {getLedgerInfo, getRecentBlocks} from "..";
import {Types} from "aptos";

export function useGetMostRecentBlocks(
  start: string | undefined,
  count: number,
) {
  const [state] = useGlobalState();
  const [recentBlocks, setRecentBlocks] = useState<Types.Block[]>([]);

  const {isLoading: isLoadingLedgerData, data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", state.network_value],
    queryFn: () => getLedgerInfo(state.aptos_client),
  });
  const currentBlockHeight = parseInt(start ?? ledgerData?.block_height ?? "");

  const {isLoading: isLoading, data: blocks} = useQuery({
    queryKey: ["block", currentBlockHeight, state.network_value],
    queryFn: async () => {
      if (currentBlockHeight !== undefined) {
        return getRecentBlocks(currentBlockHeight, count, state.aptos_client);
      }
    },
  });

  useEffect(() => {
    if (
      currentBlockHeight !== undefined &&
      !isLoadingLedgerData &&
      !isLoading &&
      blocks
    ) {
      setRecentBlocks(blocks);
    }
  }, [
    currentBlockHeight,
    state,
    count,
    isLoadingLedgerData,
    isLoading,
    blocks,
  ]);

  return {recentBlocks, isLoading};
}
