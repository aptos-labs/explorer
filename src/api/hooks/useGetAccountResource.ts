import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountResource} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetAccountResource(
  address: string,
  resource: string,
): UseQueryResult<Types.MoveResource, ResponseError> {
  const [state, _setState] = useGlobalState();

  return useQuery<Types.MoveResource, ResponseError>(
    ["accountResource", {address, resource}, state.network_value],
    () =>
      getAccountResource(
        {address, resourceType: resource},
        state.network_value,
      ),
    {refetchOnWindowFocus: false},
  );
}
