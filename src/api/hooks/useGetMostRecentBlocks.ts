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

  // const {isLoading: isLoading, data: blocks} = useQuery({
  //   queryKey: ["block", currentBlockHeight, state.network_value],
  //   queryFn: async () => {
  //     if (currentBlockHeight !== undefined) {
  //       return 
  //     }
  //   },
  // });

  useEffect(() => {
    async function fetchData() {
      if (
        currentBlockHeight !== undefined &&
        !isLoadingLedgerData 
      ) {
        const blocks = await getRecentBlocks(currentBlockHeight, count, state.aptos_client);
        setRecentBlocks(blocks);
      }
    }
    fetchData();
  }, [
    currentBlockHeight,
    state,
    count,
    isLoadingLedgerData
  ]);

  return {recentBlocks, isLoading: isLoadingLedgerData || recentBlocks.length < 1};
}
