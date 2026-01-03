import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountModule} from "..";
import {ResponseError} from "../client";
import {useNetworkValue, useAptosClient} from "../../global-config";

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
