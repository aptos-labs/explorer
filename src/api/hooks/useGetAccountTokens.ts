import {useGlobalState} from "../../global-config/GlobalConfig";
import {useQuery} from "@tanstack/react-query";
import {standardizeAddress} from "../../utils";
import {GetTokenActivityResponse} from "@aptos-labs/ts-sdk";
import {IndexerClient} from "aptos";

export function useGetAccountTokensCount(address: string) {
  const [state] = useGlobalState();
  const addr64Hash = standardizeAddress(address);
  return useQuery({
    queryKey: ["account_tokens_count", {addr64Hash}, state.network_value],
    queryFn: async () => {
      const response =
        await state.indexer_client?.getAccountTokensCount(address);
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
  const [state] = useGlobalState();
  const addr64Hash = standardizeAddress(address);
  return useQuery<TokenOwnership[]>({
    queryKey: [
      "account_tokens",
      {addr64Hash, limit, offset},
      state.network_value,
    ],
    queryFn: async () => {
      const response = await state.indexer_client?.getOwnedTokens(address, {
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
  const [state] = useGlobalState();
  return useQuery({
    queryKey: ["token_data", {tokenDataId}, state.network_value],
    queryFn: async () => {
      if (!tokenDataId) {
        return undefined;
      }
      const response = await state.indexer_client?.getTokenData(tokenDataId);
      return response?.current_token_datas_v2;
    },
  });
}

export function useGetTokenOwners(tokenDataId?: string) {
  const [state] = useGlobalState();
  return useQuery({
    queryKey: ["token_owners", {tokenDataId}, state.network_value],
    queryFn: async () => {
      if (!tokenDataId) {
        return [];
      }
      const response = await state.indexer_client?.getTokenOwnersData(
        tokenDataId,
        undefined,
        {},
      );
      return response?.current_token_ownerships_v2 ?? [];
    },
  });
}

export function useGetTokenActivitiesCount(tokenDataId: string) {
  const [state] = useGlobalState();
  return useQuery({
    queryKey: ["token_activities_count", {tokenDataId}, state.network_value],
    queryFn: async () => {
      const response =
        await state.indexer_client?.getTokenActivitiesCount(tokenDataId);
      return response?.token_activities_v2_aggregate?.aggregate?.count ?? 0;
    },
  });
}

export function useGetTokenActivities(
  tokenDataId: string,
  limit: number,
  offset?: number,
) {
  const [state] = useGlobalState();
  return useQuery({
    queryKey: [
      "token_activities",
      {tokenDataId, limit, offset},
      state.network_value,
    ],
    queryFn: async () => {
      const response: GetTokenActivityResponse =
        await state.sdk_v2_client.getDigitalAssetActivity({
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
