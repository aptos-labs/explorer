import {Types} from "aptos";
import {useQuery} from "@tanstack/react-query";
import {getTransaction} from "../../api";
import {ResponseError} from "../../api/client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetTransaction(txnHashOrVersion: string) {
  const [state] = useGlobalState();

  const result = useQuery<Types.Transaction, ResponseError>({
    queryKey: ["transaction", {txnHashOrVersion}, state.network_value],
    queryFn: () => getTransaction({txnHashOrVersion}, state.network_value),
  });

  return result;
}
