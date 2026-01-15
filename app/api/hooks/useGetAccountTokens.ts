import {
  useNetworkValue,
  useIndexerClient,
  useSdkV2Client,
} from "../../global-config";
import {useQuery, keepPreviousData} from "@tanstack/react-query";
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
      // enabled flag ensures indexerClient exists when this runs
      const response = await indexerClient!.getAccountTokensCount(address);
      return (
        response?.current_token_ownerships_v2_aggregate?.aggregate?.count ?? 0
      );
    },
    enabled: !!addr64Hash && !!indexerClient,
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
      // enabled flag ensures indexerClient exists when this runs
      const response = await indexerClient!.getOwnedTokens(address, {
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
    enabled: !!addr64Hash && !!indexerClient,
    placeholderData: keepPreviousData,
    // Token lists are semi-static - cache for 1 minute
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

export function useGetTokenData(tokenDataId?: string) {
  const networkValue = useNetworkValue();
  const indexerClient = useIndexerClient();
  return useQuery({
    queryKey: ["token_data", {tokenDataId}, networkValue],
    queryFn: async () => {
      // enabled flag ensures tokenDataId and indexerClient exist when this runs
      const response = await indexerClient!.getTokenData(tokenDataId!);
      return response?.current_token_datas_v2;
    },
    enabled: !!tokenDataId && !!indexerClient,
  });
}

export function useGetTokenOwners(tokenDataId?: string) {
  const networkValue = useNetworkValue();
  const indexerClient = useIndexerClient();
  return useQuery({
    queryKey: ["token_owners", {tokenDataId}, networkValue],
    queryFn: async () => {
      // enabled flag ensures tokenDataId and indexerClient exist when this runs
      const response = await indexerClient!.getTokenOwnersData(
        tokenDataId!,
        undefined,
        {},
      );
      return response?.current_token_ownerships_v2 ?? [];
    },
    enabled: !!tokenDataId && !!indexerClient,
  });
}

export function useGetTokenActivitiesCount(tokenDataId: string) {
  const networkValue = useNetworkValue();
  const indexerClient = useIndexerClient();
  return useQuery({
    queryKey: ["token_activities_count", {tokenDataId}, networkValue],
    queryFn: async () => {
      // enabled flag ensures indexerClient exists when this runs
      const response =
        await indexerClient!.getTokenActivitiesCount(tokenDataId);
      return response?.token_activities_v2_aggregate?.aggregate?.count ?? 0;
    },
    enabled: !!tokenDataId && !!indexerClient,
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
    placeholderData: keepPreviousData,
    // Token activities are dynamic - cache for 30 seconds
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}
