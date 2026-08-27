import {type UseQueryResult, useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useAptosClientV2, useNetworkValue} from "../../global-config";
import type {ResponseError} from "../client";
import {accountResourcesQueryOptions} from "../queries";

export function useGetAccountResources(
  address: string,
  options?: {
    retry?: number | boolean;
    enabled?: boolean;
  },
): UseQueryResult<Types.MoveResource[], ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClientV2();

  return useQuery({
    ...accountResourcesQueryOptions(address, aptosClient, networkValue),
    retry: options?.retry ?? false,
    enabled: (options?.enabled ?? true) && !!address,
  });
}
