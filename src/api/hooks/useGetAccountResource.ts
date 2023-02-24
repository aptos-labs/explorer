import {Types} from "aptos";
import {useQuery, UseQueryResult} from "react-query";
import {getAccountResource} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../GlobalState";

export function useGetAccountResource(
  address: string,
  resource: string,
): UseQueryResult<Types.MoveResource, ResponseError> {
  const [state, _setState] = useGlobalState();
  const accountResourceResult = useQuery<Types.MoveResource, ResponseError>(
    ["accountResource", {address, resource}, state.network_value],
    () =>
      getAccountResource(
        {address, resourceType: resource},
        state.network_value,
      ),
    {refetchOnWindowFocus: false},
  );
  return accountResourceResult;
}
