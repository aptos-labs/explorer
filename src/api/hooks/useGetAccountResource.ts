import {Types} from "aptos";
import {useQuery} from "react-query";
import {getAccountResources} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../GlobalState";

export function useGetAccountResource(
  address: string,
  resource: string,
): Types.MoveResource | undefined {
  const [state, _setState] = useGlobalState();
  const accountResourcesResult = useQuery<
    Array<Types.MoveResource>,
    ResponseError
  >(["accountResources", {address}, state.network_value], () =>
    getAccountResources({address}, state.network_value),
  );
  const accountResource = accountResourcesResult.data?.find(
    (r) => r.type === resource,
  );

  return accountResource;
}
