import {
  useNetworkValue,
  useIndexerClient,
  useSdkV2Client,
} from "../../global-config/GlobalConfig";
import {useQuery} from "@tanstack/react-query";
import {tryStandardizeAddress} from "../../utils";
import {GetTokenActivityResponse} from "@aptos-labs/ts-sdk";
import {IndexerClient} from "aptos";

export function useGetAccountTokensCount(address: string) {
  const networkValue = useNetworkValue();
  const indexerClient = useIndexerClient();
  const addr64Hash = tryStandardizeAddress(address);
  return useQuery({
    queryKey: ["account_tokens_count", {addr64Hash}, networkValue],
    queryFn: async () => {
      if (!addr64Hash) {
        return 0;
      }
      const response = await indexerClient?.getAccountTokensCount(address);
      return (
        response?.current_token_ownerships_v2_aggregate?.aggregate?.count ?? 0
      );
    },
  });
}

export type TokenOwnership = Awaited<
  ReturnType<IndexerClient["getOwnedTokens"]>
>["current_token_ownerships_v2"][0];

export function useGetAccountTokens(
  address: string,
  limit: number,
  offset?: number,
) {
  const networkValue = useNetworkValue();
  const indexerClient = useIndexerClient();
  const addr64Hash = tryStandardizeAddress(address);
  return useQuery<TokenOwnership[]>({
    queryKey: ["account_tokens", {addr64Hash, limit, offset}, networkValue],
    queryFn: async () => {
      if (!addr64Hash) {
        return [];
      }
      const response = await indexerClient?.getOwnedTokens(address, {
        options: {
          limit,
          offset,
        },
        orderBy: [
          {
            last_transaction_version: "desc",
          },
          {
            token_data_id: "desc",
          },
        ],
      });
      return response?.current_token_ownerships_v2 ?? [];
    },
  });
}

export function useGetTokenData(tokenDataId?: string) {
  const networkValue = useNetworkValue();
  const indexerClient = useIndexerClient();
  return useQuery({
    queryKey: ["token_data", {tokenDataId}, networkValue],
    queryFn: async () => {
      if (!tokenDataId) {
        return undefined;
      }
      const response = await indexerClient?.getTokenData(tokenDataId);
      return response?.current_token_datas_v2;
    },
  });
}

export function useGetTokenOwners(tokenDataId?: string) {
  const networkValue = useNetworkValue();
  const indexerClient = useIndexerClient();
  return useQuery({
    queryKey: ["token_owners", {tokenDataId}, networkValue],
    queryFn: async () => {
      if (!tokenDataId) {
        return [];
      }
      const response = await indexerClient?.getTokenOwnersData(
        tokenDataId,
        undefined,
        {},
      );
      return response?.current_token_ownerships_v2 ?? [];
    },
  });
}

export function useGetTokenActivitiesCount(tokenDataId: string) {
  const networkValue = useNetworkValue();
  const indexerClient = useIndexerClient();
  return useQuery({
    queryKey: ["token_activities_count", {tokenDataId}, networkValue],
    queryFn: async () => {
      const response =
        await indexerClient?.getTokenActivitiesCount(tokenDataId);
      return response?.token_activities_v2_aggregate?.aggregate?.count ?? 0;
    },
  });
}

export function useGetTokenActivities(
  tokenDataId: string,
  limit: number,
  offset?: number,
) {
  const networkValue = useNetworkValue();
  const sdkV2Client = useSdkV2Client();
  return useQuery({
    queryKey: ["token_activities", {tokenDataId, limit, offset}, networkValue],
    queryFn: async () => {
      const response: GetTokenActivityResponse =
        await sdkV2Client.getDigitalAssetActivity({
          digitalAssetAddress: tokenDataId,
          options: {
            limit,
            offset,
            orderBy: [
              {
                transaction_version: "desc",
              },
            ],
          },
        });
      return response;
    },
  });
}
