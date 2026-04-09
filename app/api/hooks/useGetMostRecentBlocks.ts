import {useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {
  useAptosClient,
  useNetworkValue,
  useSdkV2Client,
} from "../../global-config";
import {getLedgerInfo} from "..";
import {getRecentBlocks} from "../v2";

/**
 * Recent blocks for `/blocks`. Uses the same REST `getBlockByHeight` data as block
 * detail pages so hash, timestamps, and version ranges stay consistent with the API.
 */
export function useGetMostRecentBlocks(
  start: string | undefined,
  count: number,
) {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const sdkV2Client = useSdkV2Client();

  const {isLoading: isLoadingLedgerData, data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", networkValue],
    queryFn: () => getLedgerInfo(aptosClient),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
  const currentBlockHeight = parseInt(
    start ?? ledgerData?.block_height ?? "",
    10,
  );

  const {isLoading, data: blocks} = useQuery<Types.Block[]>({
    queryKey: ["recentBlocksRest", currentBlockHeight, count, networkValue],
    queryFn: async () => {
      if (!Number.isFinite(currentBlockHeight)) {
        return [];
      }
      const restBlocks = await getRecentBlocks(
        currentBlockHeight,
        count,
        sdkV2Client,
      );
      return restBlocks.map((b) => ({
        block_height: b.block_height,
        block_hash: b.block_hash,
        block_timestamp: b.block_timestamp,
        first_version: b.first_version,
        last_version: b.last_version,
      }));
    },
    enabled: Number.isFinite(currentBlockHeight),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const recentBlocks =
    currentBlockHeight !== undefined &&
    !isLoadingLedgerData &&
    !isLoading &&
    blocks
      ? blocks
      : [];

  return {recentBlocks, isLoading};
}
