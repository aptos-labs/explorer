import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountModules} from "../../v2";
import {ResponseError} from "../../client";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {MoveModuleBytecode} from "@aptos-labs/ts-sdk";

export function useGetAccountModules(
  address: string,
): UseQueryResult<MoveModuleBytecode[], ResponseError> {
  const [state] = useGlobalState();

  return useQuery<Array<MoveModuleBytecode>, ResponseError>({
    queryKey: ["accountModules", {address}, state.network_value],
    queryFn: () => getAccountModules({address}, state.sdk_v2_client),
  });
}
