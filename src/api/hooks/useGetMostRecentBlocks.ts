import {useGlobalState} from "../../global-config/GlobalConfig";
import {useQuery} from "@tanstack/react-query";
import {getLedgerInfo, getRecentBlocks} from "..";

export function useGetMostRecentBlocks(
  start: string | undefined,
  count: number,
) {
  const [state] = useGlobalState();

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

  // Calculate recentBlocks during render instead of using useEffect
  const recentBlocks =
    currentBlockHeight !== undefined &&
    !isLoadingLedgerData &&
    !isLoading &&
    blocks
      ? blocks
      : [];

  return {recentBlocks, isLoading};
}
