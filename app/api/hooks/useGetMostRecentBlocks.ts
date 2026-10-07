import {useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {
  useAptosClient,
  useNetworkName,
  useNetworkValue,
  useSdkV2Client,
} from "../../global-config";
import {
  normalizeGeomiDevApiKeyOverride,
  useExplorerSettings,
} from "../../settings";
import {getLedgerInfo} from "..";
import {getRecentBlocks} from "../v2";

function parseLedgerBlockHeight(value: string | undefined): number | undefined {
  if (value == null || value === "") return undefined;
  const height = Number(value);
  if (!Number.isSafeInteger(height) || height < 0) return undefined;
  return height;
}

/**
 * Recent blocks for `/blocks`. Uses the same REST `getBlockByHeight` data as block
 * detail pages so hash, timestamps, and version ranges stay consistent with the API.
 *
 * `newestHeight` is the inclusive top of a frozen window. Omit it to follow the
 * ledger tip. `count` is how many heights to load, walking downward from that top.
 */
export function useGetMostRecentBlocks(
  newestHeight: number | undefined,
  count: number,
) {
  const networkName = useNetworkName();
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const sdkV2Client = useSdkV2Client();
  const {
    settings: {geomiDevApiKeyOverridesByNetwork},
  } = useExplorerSettings();
  const apiKeyIdentity = normalizeGeomiDevApiKeyOverride(
    geomiDevApiKeyOverridesByNetwork[networkName],
  );

  const {isLoading: isLoadingLedgerData, data: ledgerData} = useQuery({
    queryKey: ["ledgerInfo", networkValue, apiKeyIdentity],
    queryFn: () => getLedgerInfo(aptosClient),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
  const ledgerBlockHeight = parseLedgerBlockHeight(ledgerData?.block_height);
  const currentBlockHeight = newestHeight ?? ledgerBlockHeight;

  const {
    isLoading,
    isFetching,
    data: blocks,
  } = useQuery<Types.Block[]>({
    queryKey: [
      "recentBlocksRest",
      currentBlockHeight,
      count,
      networkValue,
      apiKeyIdentity,
    ],
    queryFn: async () => {
      if (currentBlockHeight === undefined) {
        return [];
      }
      const safeCount = Math.min(count, currentBlockHeight + 1);
      const restBlocks = await getRecentBlocks(
        currentBlockHeight,
        safeCount,
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
    enabled: currentBlockHeight !== undefined && count > 0,
    placeholderData: (previousData, previousQuery) => {
      const previousKey = previousQuery?.queryKey;
      if (!previousKey) return undefined;
      if (
        previousKey[3] !== networkValue ||
        previousKey[4] !== apiKeyIdentity
      ) {
        return undefined;
      }
      return previousData;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const recentBlocks = blocks ?? [];
  const waitingForLedger =
    newestHeight === undefined &&
    ledgerBlockHeight === undefined &&
    isLoadingLedgerData;
  const waitingForBlocks = isFetching && recentBlocks.length === 0;

  return {
    recentBlocks,
    isLoading: isLoading || waitingForLedger || waitingForBlocks,
    ledgerBlockHeight,
  };
}
