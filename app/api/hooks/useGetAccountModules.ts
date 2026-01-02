import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountModules} from "..";
import {ResponseError} from "../client";
import {useNetworkValue, useAptosClient} from "../../global-config";

export function useGetAccountModules(
  address: string,
): UseQueryResult<Types.MoveModuleBytecode[], ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  return useQuery<Array<Types.MoveModuleBytecode>, ResponseError>({
    queryKey: ["accountModules", {address}, networkValue],
    queryFn: () => getAccountModules({address}, aptosClient),
    // Module code is semi-static - cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}
