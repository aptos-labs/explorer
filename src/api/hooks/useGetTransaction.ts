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
    // Transaction data is static once confirmed - cache for 1 hour
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });
}
