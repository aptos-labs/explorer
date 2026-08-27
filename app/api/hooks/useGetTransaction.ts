import {useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useNetworkValue, useSdkV2Client} from "../../global-config";
import type {ResponseError} from "../client";
import {getTransaction} from "../client";

export function useGetTransaction(txnHashOrVersion: string) {
  const networkValue = useNetworkValue();
  const aptosClient = useSdkV2Client();

  return useQuery<Types.Transaction, ResponseError>({
    queryKey: ["transaction", {txnHashOrVersion}, networkValue],
    queryFn: () => getTransaction(txnHashOrVersion, aptosClient),
    // Transaction data is static once confirmed - cache for 1 hour
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });
}
