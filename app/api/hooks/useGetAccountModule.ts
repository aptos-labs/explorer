import {type UseQueryResult, useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {getAccountModule} from "..";
import type {ResponseError} from "../client";

export function useGetAccountModule(
  address: string,
  moduleName: string,
): UseQueryResult<Types.MoveModuleBytecode, ResponseError> {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();

  return useQuery<Types.MoveModuleBytecode, ResponseError>({
    queryKey: ["accountModule", {address, moduleName}, networkValue],
    queryFn: () => getAccountModule({address, moduleName}, aptosClient),
    refetchOnWindowFocus: false,
  });
}
