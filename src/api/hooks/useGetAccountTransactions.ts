import {Types} from "aptos";
import {useQuery, UseQueryResult} from "react-query";
import {getAccountTransactions} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../GlobalState";

export function useGetAccountTransactions(
  address: string,
): UseQueryResult<Array<Types.Transaction>, ResponseError> {
  const [state, _setState] = useGlobalState();

  const accountTransactionsResult = useQuery<
    Array<Types.Transaction>,
    ResponseError
  >(["accountTransactions", {address}, state.network_value], () =>
    getAccountTransactions({address}, state.network_value),
  );

  return accountTransactionsResult;
}
