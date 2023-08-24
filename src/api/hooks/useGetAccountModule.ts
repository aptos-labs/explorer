import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountModule} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetAccountModule(
  address: string,
  moduleName: string,
): UseQueryResult<Types.MoveModuleBytecode, ResponseError> {
  const [state] = useGlobalState();

  return useQuery<Types.MoveModuleBytecode, ResponseError>(
    ["accountModule", {address, moduleName}, state.network_value],
    () => getAccountModule({address, moduleName}, state.network_value),
    {refetchOnWindowFocus: false},
  );
}
