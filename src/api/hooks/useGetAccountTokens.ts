import {
  Current_Token_Datas,
  Current_Token_Datas_V2,
  Current_Token_Ownerships_V2,
} from "aptos";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {useQuery} from "@tanstack/react-query";
import {normalizeAddress} from "../../utils";

export function useGetAccountTokensCount(address: string) {
  const [state] = useGlobalState();
  const addr64Hash = normalizeAddress(address);
  return useQuery(
    ["account_tokens_count", {addr64Hash}, state.network_value],
    async () => {
      const response = await state.indexer_client?.getAccountTokensCount(
        address,
      );
      return (
        response?.current_token_ownerships_v2_aggregate?.aggregate?.count ?? 0
      );
    },
  );
}

export function useGetAccountTokens(
  address: string,
  limit: number,
  offset?: number,
) {
  const [state] = useGlobalState();
  const addr64Hash = normalizeAddress(address);
  return useQuery(
    ["account_tokens", {addr64Hash, limit, offset}, state.network_value],
    async () => {
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
  );
}

export function useGetTokenData(tokenDataId?: string) {
  const [state] = useGlobalState();
  return useQuery(
    ["token_data", {tokenDataId}, state.network_value],
    async () => {
      if (!tokenDataId) {
        return undefined;
      }
      const response = await state.indexer_client?.getTokenData(tokenDataId);
      return response?.current_token_datas_v2;
    },
  );
}

export function useGetTokenOwners(tokenDataId?: string) {
  const [state] = useGlobalState();
  return useQuery(
    ["token_owners", {tokenDataId}, state.network_value],
    async () => {
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
  );
}

export function useGetTokenActivitiesCount(tokenDataId: string) {
  const [state] = useGlobalState();
  return useQuery(
    ["token_activities_count", {tokenDataId}, state.network_value],
    async () => {
      const response = await state.indexer_client?.getTokenActivitiesCount(
        tokenDataId,
      );
      return response?.token_activities_v2_aggregate?.aggregate?.count ?? 0;
    },
  );
}

export function useGetTokenActivities(
  tokenDataId: string,
  limit: number,
  offset?: number,
) {
  const [state] = useGlobalState();
  return useQuery(
    ["token_activities", {tokenDataId, limit, offset}, state.network_value],
    async () => {
      const response = await state.indexer_client?.getTokenActivities(
        tokenDataId,
        {
          options: {
            limit,
            offset,
          },
          orderBy: [
            {
              transaction_version: "desc",
            },
          ],
        },
      );
      return response?.token_activities_v2 ?? [];
    },
  );
}
