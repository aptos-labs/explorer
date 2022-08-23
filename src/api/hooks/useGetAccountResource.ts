import {Types} from "aptos";
import {useQuery} from "react-query";
import {getAccountResources} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../GlobalState";

type useGetAccountResourceResponse = {
  accountResource: Types.MoveResource | undefined;
  isLoading: boolean;
};

export function useGetAccountResource(
  address: string,
  resource: string,
): useGetAccountResourceResponse {
  const [state, _setState] = useGlobalState();
  const accountResourcesResult = useQuery<
    Array<Types.MoveResource>,
    ResponseError
  >(
    ["accountResources", {address}, state.network_value],
    () => getAccountResources({address}, state.network_value),
    {refetchOnWindowFocus: false},
  );

  const {isLoading} = accountResourcesResult;

  const accountResource = accountResourcesResult.data?.find(
    (r) => r.type === resource,
  );

  return {accountResource, isLoading};
}
