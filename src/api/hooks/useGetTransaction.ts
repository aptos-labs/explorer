import {Types} from "aptos";
import {useQuery} from "react-query";
import {getTransaction} from "../../api";
import {ResponseError} from "../../api/client";
import {useGlobalState} from "../../GlobalState";

export function useGetTransaction(txnHashOrVersion: string) {
  const [state, _setState] = useGlobalState();

  const result = useQuery<Types.Transaction, ResponseError>(
    ["transaction", {txnHashOrVersion}, state.network_value],
    () => getTransaction({txnHashOrVersion}, state.network_value),
  );

  return result;
}
