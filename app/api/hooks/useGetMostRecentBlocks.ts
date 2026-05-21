import {useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {
  useNetworkName,
  useNetworkValue,
  useSdkV2Client,
} from "../../global-config";
import {
  normalizeGeomiDevApiKeyOverride,
  useExplorerSettings,
} from "../../settings";
import {getRecentBlocks} from "../v2";
import {useGetLedgerInfo} from "./useGetLedgerInfo";

/**
 * Recent blocks for `/blocks`. Uses the same REST `getBlockByHeight` data as block
 * detail pages so hash, timestamps, and version ranges stay consistent with the API.
 */
export function useGetMostRecentBlocks(
  start: string | undefined,
  count: number,
) {
  const networkName = useNetworkName();
  const networkValue = useNetworkValue();
  const sdkV2Client = useSdkV2Client();
  const {
    settings: {geomiDevApiKeyOverridesByNetwork},
  } = useExplorerSettings();
  const apiKeyIdentity = normalizeGeomiDevApiKeyOverride(
    geomiDevApiKeyOverridesByNetwork[networkName],
  );

  // Shared ledger-info polling. The `/blocks` page is also typically open
  // with the TPS pill (which polls every 15 s) so this just subscribes to
  // the same shared query rather than spinning up a duplicate poller.
  const {isLoading: isLoadingLedgerData, data: ledgerData} = useGetLedgerInfo({
    staleTimeMs: 60 * 1000,
    gcTimeMs: 5 * 60 * 1000,
  });
  const currentBlockHeight = parseInt(
    start ?? ledgerData?.block_height ?? "",
    10,
  );

  const {isLoading, data: blocks} = useQuery<Types.Block[]>({
    queryKey: [
      "recentBlocksRest",
      currentBlockHeight,
      count,
      networkValue,
      apiKeyIdentity,
    ],
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
