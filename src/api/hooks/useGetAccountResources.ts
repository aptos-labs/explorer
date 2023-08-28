import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountResources} from "../../api";
import {ResponseError} from "../../api/client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetAccountResources(
  address: string,
): UseQueryResult<Types.MoveResource[], ResponseError> {
  const [state] = useGlobalState();

  return useQuery<Array<Types.MoveResource>, ResponseError>(
    ["accountResources", {address}, state.network_value],
    () => getAccountResources({address}, state.network_value),
  );
}
