import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountModules} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetAccountModules(
  address: string,
): UseQueryResult<Types.MoveModuleBytecode[], ResponseError> {
  const [state] = useGlobalState();

  return useQuery<Array<Types.MoveModuleBytecode>, ResponseError>({
    queryKey: ["accountModules", {address}, state.network_value],
    queryFn: () => getAccountModules({address}, state.aptos_client),
    // Module code is semi-static - cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}
