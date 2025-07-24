import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountModule} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetAccountModule(
  address: string,
  moduleName: string,
  enabled: boolean = true,
): UseQueryResult<Types.MoveModuleBytecode, ResponseError> {
  const [state] = useGlobalState();

  return useQuery<Types.MoveModuleBytecode, ResponseError>({
    queryKey: ["accountModule", {address, moduleName}, state.network_value],
    queryFn: () => getAccountModule({address, moduleName}, state.aptos_client),
    refetchOnWindowFocus: false,
    enabled: enabled && !!address && !!moduleName,
  });
}
