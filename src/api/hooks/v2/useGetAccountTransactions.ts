import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountTransactions} from "../../v2";
import {ResponseError} from "../../client";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {TransactionResponse} from "@aptos-labs/ts-sdk";

export function useGetAccountTransactions(
  address: string,
  start?: number,
  limit?: number,
): UseQueryResult<Array<TransactionResponse>, ResponseError> {
  const [state] = useGlobalState();

  return useQuery<Array<TransactionResponse>, ResponseError>({
    queryKey: [
      "accountTransactions",
      {address, start, limit},
      state.network_value,
    ],
    queryFn: () =>
      getAccountTransactions({address, start, limit}, state.sdk_v2_client),
  });
}
