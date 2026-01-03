import {useNetworkValue, useAptosClient} from "../../global-config";
import {useQuery} from "@tanstack/react-query";
import {getLedgerInfo, getRecentBlocks} from "..";

export function useGetMostRecentBlocks(
  start: string | undefined,
  count: number,
) {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  const {isLoading: isLoadingLedgerData, data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", networkValue],
    queryFn: () => getLedgerInfo(aptosClient),
    // Real-time data - no stale time
    staleTime: 0,
    gcTime: 30 * 1000, // Keep in cache for 30 seconds
  });
  const currentBlockHeight = parseInt(start ?? ledgerData?.block_height ?? "");

  const {isLoading: isLoading, data: blocks} = useQuery({
    queryKey: ["block", currentBlockHeight, networkValue],
    queryFn: async () => {
      if (currentBlockHeight !== undefined) {
        return getRecentBlocks(currentBlockHeight, count, aptosClient);
      }
    },
    enabled: currentBlockHeight !== undefined,
    // Recent blocks are dynamic - cache for 30 seconds
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
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
