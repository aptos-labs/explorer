import {useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {
  useAptosClient,
  useNetworkValue,
  useSdkV2Client,
} from "../../global-config";
import {getLedgerInfo} from "..";

const RECENT_BLOCKS_QUERY = `
  query RecentBlocks($maxBlockHeight: bigint!, $limit: Int!) {
    block_metadata_transactions(
      where: {block_height: {_lte: $maxBlockHeight}}
      order_by: {block_height: desc}
      limit: $limit
    ) {
      block_height
      id
      timestamp
      version
    }
  }
`;

type BlockMetadataTransactionSummary = {
  block_height: number | string;
  id: string;
  timestamp: string;
  version: number | string;
};

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
    refetchOnMount: false,
  });
  const currentBlockHeight = parseInt(
    start ?? ledgerData?.block_height ?? "",
    10,
  );

  const {isLoading, data: blocks} = useQuery<Types.Block[]>({
    queryKey: ["recentBlocks", currentBlockHeight, count, networkValue],
    queryFn: async () => {
      if (!Number.isFinite(currentBlockHeight) || !ledgerData?.ledger_version) {
        return [];
      }
      const upperBound = currentBlockHeight + 1;
      const response = await sdkV2Client.queryIndexer<{
        block_metadata_transactions: BlockMetadataTransactionSummary[];
      }>({
        query: {
          query: RECENT_BLOCKS_QUERY,
          variables: {
            maxBlockHeight: upperBound,
            limit: count + 1,
          },
        },
      });

      const rows = response.block_metadata_transactions ?? [];
      const sentinel =
        rows.length > 0 && Number(rows[0].block_height) > currentBlockHeight
          ? rows[0]
          : undefined;
      const recentRows = sentinel
        ? rows.slice(1, count + 1)
        : rows.slice(0, count);

      return recentRows.map((row, index) => {
        const nextFirstVersion =
          index === 0
            ? sentinel
              ? BigInt(sentinel.version)
              : BigInt(ledgerData.ledger_version) + 1n
            : BigInt(recentRows[index - 1].version);

        return {
          block_height: row.block_height.toString(),
          block_hash: row.id,
          block_timestamp: row.timestamp,
          first_version: row.version.toString(),
          last_version: (nextFirstVersion - 1n).toString(),
        };
      });
    },
    enabled:
      Number.isFinite(currentBlockHeight) && !!ledgerData?.ledger_version,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
