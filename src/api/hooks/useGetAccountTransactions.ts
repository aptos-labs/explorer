import {Types} from "aptos";
import {useQuery, UseQueryResult} from "react-query";
import {getAccountTransactions} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../GlobalState";

const QUERY_LIMIT = 100;

export function useGetAccountTransactions(
  address: string,
  sequenceNumber: string | undefined,
): UseQueryResult<Array<Types.Transaction>, ResponseError> {
  const [state, _setState] = useGlobalState();

  const sequence = sequenceNumber === undefined ? 0 : parseInt(sequenceNumber);
  const limit = sequence < QUERY_LIMIT ? undefined : QUERY_LIMIT;
  const start = sequence < QUERY_LIMIT ? undefined : sequence - QUERY_LIMIT;

  const accountTransactionsResult = useQuery<
    Array<Types.Transaction>,
    ResponseError
  >(["accountTransactions", {address,start, limit}, state.network_value], () =>
    getAccountTransactions({address, start, limit}, state.network_value),
  );

  return accountTransactionsResult;
}
