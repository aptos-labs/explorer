import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountModule} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {AccountAddress, MoveModuleBytecode} from "@aptos-labs/ts-sdk";

export function useGetAccountModule(
  address: string,
  moduleName: string,
): UseQueryResult<MoveModuleBytecode, ResponseError> {
  const [state] = useGlobalState();

  return useQuery<MoveModuleBytecode, ResponseError>({
    queryKey: ["accountModule", {address, moduleName}, state.network_value],
    queryFn: () =>
      getAccountModule(
        {address: AccountAddress.from(address), moduleName},
        state.sdk_v2_client,
      ),
    refetchOnWindowFocus: false,
  });
}
