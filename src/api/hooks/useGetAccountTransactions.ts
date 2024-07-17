import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountTransactions} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetAccountTransactions(
  address: string,
  start?: number,
  limit?: number,
): UseQueryResult<Array<Types.Transaction>, ResponseError> {
  const [state] = useGlobalState();

  const accountTransactionsResult = useQuery<
    Array<Types.Transaction>,
    ResponseError
  >({
    queryKey: [
      "accountTransactions",
      {address, start, limit},
      state.network_value,
    ],
    queryFn: () =>
      getAccountTransactions({address, start, limit}, state.aptos_client),
  });

  return accountTransactionsResult;
}
