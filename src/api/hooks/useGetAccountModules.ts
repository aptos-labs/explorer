import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountModules} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {AccountAddress, MoveModuleBytecode} from "@aptos-labs/ts-sdk";

export function useGetAccountModules(
  address: string,
): UseQueryResult<MoveModuleBytecode[], ResponseError> {
  const [state] = useGlobalState();

  return useQuery<Array<MoveModuleBytecode>, ResponseError>({
    queryKey: ["accountModules", {address}, state.network_value],
    queryFn: () =>
      getAccountModules(
        {address: AccountAddress.from(address)},
        state.sdk_v2_client,
      ),
  });
}
