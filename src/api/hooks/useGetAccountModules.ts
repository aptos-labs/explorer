import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountModules} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetAccountModules(
  address: string,
): UseQueryResult<Types.MoveModuleBytecode[], ResponseError> {
  const [state, _setState] = useGlobalState();

  return useQuery<Array<Types.MoveModuleBytecode>, ResponseError>(
    ["accountModules", {address}, state.network_value],
    () => getAccountModules({address}, state.network_value),
  );
}
