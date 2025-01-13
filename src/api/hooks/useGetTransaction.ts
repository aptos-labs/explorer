import {Types} from "aptos";
import {useQuery} from "@tanstack/react-query";
import {getTransaction} from "../index";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetTransaction(txnHashOrVersion: string) {
  const [state] = useGlobalState();

  return useQuery<Types.Transaction, ResponseError>({
    queryKey: ["transaction", {txnHashOrVersion}, state.network_value],
    queryFn: () => getTransaction({txnHashOrVersion}, state.aptos_client),
  });
}
