import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountTransactions} from "..";
import {ResponseError} from "../client";
import {useNetworkValue, useAptosClient} from "../../global-config";

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
