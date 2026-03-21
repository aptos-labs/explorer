import {type UseQueryResult, useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {getAccountModules} from "..";
import type {ResponseError} from "../client";

export function useGetAccountModules(
  address: string,
  ledgerVersion?: number,
): UseQueryResult<Types.MoveModuleBytecode[], ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  return useQuery<Array<Types.MoveModuleBytecode>, ResponseError>({
    queryKey: ["accountModules", {address, ledgerVersion}, networkValue],
    queryFn: () => getAccountModules({address, ledgerVersion}, aptosClient),
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
