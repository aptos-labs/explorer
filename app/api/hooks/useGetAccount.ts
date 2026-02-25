import {useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {getAccount} from "..";
import type {ResponseError} from "../client";

export function useGetAccount(
  address: string,
  options?: {retry?: number | boolean},
) {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  return useQuery<Types.AccountData, ResponseError>({
    queryKey: ["account", {address}, networkValue],
    queryFn: () => getAccount({address}, aptosClient),
    retry: options?.retry ?? false,
    // Account data is semi-static - cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}
