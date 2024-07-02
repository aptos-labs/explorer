import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountResources} from "../../api";
import {ResponseError} from "../../api/client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {AccountAddress, MoveResource} from "@aptos-labs/ts-sdk";

export function useGetAccountResources(
  address: string,
  options?: {
    retry?: number | boolean;
  },
): UseQueryResult<MoveResource[], ResponseError> {
  const [state] = useGlobalState();

  return useQuery<Array<MoveResource>, ResponseError>({
    queryKey: ["accountResources", {address}, state.network_value],
    queryFn: () =>
      getAccountResources(
        {address: AccountAddress.from(address)},
        state.sdk_v2_client,
      ),
    retry: options?.retry ?? false,
  });
}
