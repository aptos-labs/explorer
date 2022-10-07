import {Types} from "aptos";
import {useQuery, UseQueryResult} from "react-query";
import {getAccountTransactions} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../GlobalState";

export function useGetAccountTransactions(
  address: string,
  start?: number,
  limit?: number,
): UseQueryResult<Array<Types.Transaction>, ResponseError> {
  const [state, _setState] = useGlobalState();

  const accountTransactionsResult = useQuery<
    Array<Types.Transaction>,
    ResponseError
  >(["accountTransactions", {address, start, limit}, state.network_value], () =>
    getAccountTransactions({address, start, limit}, state.network_value),
  );

  return accountTransactionsResult;
}
