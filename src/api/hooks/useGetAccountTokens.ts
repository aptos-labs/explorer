import {useGlobalState} from "../../global-config/GlobalConfig";
import {useQuery} from "@tanstack/react-query";
import {standardizeAddress} from "../../utils";
import {
  GetAccountOwnedTokensQueryResponse,
  GetTokenActivityResponse,
} from "@aptos-labs/ts-sdk";
import {IndexerClient} from "aptos";
import {GetCurrentTokenOwnershipResponse} from "@aptos-labs/ts-sdk/src/types";

export function useGetAccountTokensCount(address: string) {
  const [state] = useGlobalState();
  const addr64Hash = standardizeAddress(address);
  return useQuery({
    queryKey: ["account_tokens_count", {addr64Hash}, state.network_value],
    queryFn: async () => {
      return state.sdk_v2_client.getAccountTokensCount({
        accountAddress: address,
      });
    },
  });
}

export function useGetAccountTokens(
  address: string,
  limit: number,
  offset?: number,
) {
  const [state] = useGlobalState();
  const addr64Hash = standardizeAddress(address);
  return useQuery<GetAccountOwnedTokensQueryResponse>({
    queryKey: [
      "account_tokens",
      {addr64Hash, limit, offset},
      state.network_value,
    ],
    queryFn: async () => {
      return state.sdk_v2_client.getAccountOwnedTokens({
        accountAddress: address,
        options: {
          limit,
          offset,
          orderBy: [
            {last_transaction_version: "desc"},
            {token_data_id: "desc"},
          ],
        },
      });
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
      return state.sdk_v2_client.getDigitalAssetData({
        digitalAssetAddress: tokenDataId,
      });
    },
  });
}

export function useGetTokenOwners(tokenDataId?: string) {
  const [state] = useGlobalState();
  return useQuery({
    queryKey: ["token_owners", {tokenDataId}, state.network_value],
    queryFn: async () => {
      if (!tokenDataId) {
        return undefined;
      }

      return state.sdk_v2_client.getCurrentDigitalAssetOwnership({
        digitalAssetAddress: tokenDataId,
      });
    },
  });
}

export function useGetTokenActivitiesCount(tokenDataId: string) {
  const [state] = useGlobalState();
  return useQuery({
    queryKey: ["token_activities_count", {tokenDataId}, state.network_value],
    queryFn: async () => {
      const response = await state.sdk_v2_client.getDigitalAssetActivity({
        digitalAssetAddress: tokenDataId,
      });
      return response.length;
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
