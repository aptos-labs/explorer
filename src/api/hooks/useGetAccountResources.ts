import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountResources} from "../index";
import {ResponseError} from "../client";
import {
  useNetworkValue,
  useAptosClient,
} from "../../global-config/GlobalConfig";

export function useGetAccountResources(
  address: string,
  options?: {
    retry?: number | boolean;
  },
): UseQueryResult<Types.MoveResource[], ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  return useQuery<Array<Types.MoveResource>, ResponseError>({
    queryKey: ["accountResources", {address}, networkValue],
    queryFn: () => getAccountResources({address}, aptosClient),
    retry: options?.retry ?? false,
    // Account resources are semi-static - cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}
