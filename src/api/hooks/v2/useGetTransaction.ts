import {useQuery} from "@tanstack/react-query";
import {getTransaction} from "../../v2";
import {ResponseError} from "../../client";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {TransactionResponse} from "@aptos-labs/ts-sdk";

export function useGetTransaction(txnHashOrVersion: string) {
  const [state] = useGlobalState();

  return useQuery<TransactionResponse, ResponseError>({
    queryKey: ["transaction", {txnHashOrVersion}, state.network_value],
    queryFn: () => getTransaction({txnHashOrVersion}, state.sdk_v2_client),
  });
}
