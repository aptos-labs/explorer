import {useGlobalState} from "../../global-config/GlobalConfig";
import {useQuery} from "@tanstack/react-query";
import {normalizeAddress} from "../../utils";
import {GetTokenActivityResponse} from "@aptos-labs/ts-sdk";

export function useGetAccountTokensCount(address: string) {
  const [state] = useGlobalState();
  const addr64Hash = normalizeAddress(address);
  return useQuery({
    queryKey: ["account_tokens_count", {addr64Hash}, state.network_value],
    queryFn: async () => {
      return await state.sdk_v2_client.getAccountTokensCount({
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
  const addr64Hash = normalizeAddress(address);
  return useQuery({
    queryKey: [
      "account_tokens",
      {addr64Hash, limit, offset},
      state.network_value,
    ],
    queryFn: async () => {
      return await state.sdk_v2_client.getAccountOwnedTokens({
        accountAddress: address,
        options: {
          limit,
          offset,
          orderBy: [
            {
              last_transaction_version: "desc",
            },
            {
              token_data_id: "desc",
            },
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
      return await state.sdk_v2_client.getDigitalAssetData({
        digitalAssetAddress: tokenDataId,
      });
    },
  });
}

export function useGetTokenOwner(tokenDataId?: string) {
  const [state] = useGlobalState();
  return useQuery({
    queryKey: ["token_owners", {tokenDataId}, state.network_value],
    queryFn: async () => {
      if (!tokenDataId) {
        return undefined;
      }
      return await state.sdk_v2_client.getCurrentDigitalAssetOwnership({
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
      return response.length ?? 0;
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
      const response: GetTokenActivityResponse | undefined =
        await state.sdk_v2_client?.getDigitalAssetActivity({
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
      return response ?? [];
    },
  });
}
