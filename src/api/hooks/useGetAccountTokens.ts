import {useGlobalState} from "../../global-config/GlobalConfig";
import {useQuery} from "@tanstack/react-query";

export function useGetAccountTokensCount(address: string) {
  const [state] = useGlobalState();
  // whenever talking to the indexer, the address needs to fill in leading 0s
  // for example: 0x123 => 0x000...000123  (61 0s before 123)
  const addr64Hash = "0x" + address.substring(2).padStart(64, "0");
  return useQuery(
    ["account_tokens_count", {addr64Hash}, state.network_value],
    async () => {
      const response = await state.indexer_client?.getAccountTokensCount(
        address,
      );
      return (
        response?.current_token_ownerships_aggregate?.aggregate?.count ?? 0
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
  // whenever talking to the indexer, the address needs to fill in leading 0s
  // for example: 0x123 => 0x000...000123  (61 0s before 123)
  const addr64Hash = "0x" + address.substring(2).padStart(64, "0");
  return useQuery(
    ["account_tokens", {addr64Hash, limit, offset}, state.network_value],
    async () => {
      const response = await state.indexer_client?.getOwnedTokens(address, {
        options: {
          limit,
          offset,
        },
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
      return response?.current_token_datas_v2 ?? [];
    },
  );
}
