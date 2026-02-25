import {type UseQueryResult, useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {getAccountTransactions} from "..";
import type {ResponseError} from "../client";

export function useGetAccountTransactions(
  address: string,
  start?: number,
  limit?: number,
): UseQueryResult<Array<Types.Transaction>, ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  return useQuery<Array<Types.Transaction>, ResponseError>({
    queryKey: ["accountTransactions", {address, start, limit}, networkValue],
    queryFn: () => getAccountTransactions({address, start, limit}, aptosClient),
    // Transaction lists are dynamic - cache for 30 seconds
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}
