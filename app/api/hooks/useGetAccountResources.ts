import {type UseQueryResult, useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkValue} from "../../global-config";
import type {ResponseError} from "../client";
import {getAccountResources} from "../index";

export function useGetAccountResources(
  address: string,
  options?: {
    retry?: number | boolean;
    enabled?: boolean;
  },
): UseQueryResult<Types.MoveResource[], ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  return useQuery<Array<Types.MoveResource>, ResponseError>({
    queryKey: ["accountResources", {address}, networkValue],
    queryFn: () => getAccountResources({address}, aptosClient),
    retry: options?.retry ?? false,
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
