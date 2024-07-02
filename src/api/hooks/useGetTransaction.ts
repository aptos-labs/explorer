import {useQuery} from "@tanstack/react-query";
import {getTransaction} from "../../api";
import {ResponseError} from "../../api/client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {TransactionResponse} from "@aptos-labs/ts-sdk";

export function useGetTransaction(txnHashOrVersion: string) {
  const [state] = useGlobalState();

  const result = useQuery<TransactionResponse, ResponseError>({
    queryKey: ["transaction", {txnHashOrVersion}, state.network_value],
    queryFn: () => getTransaction({txnHashOrVersion}, state.sdk_v2_client),
  });

  return result;
}
