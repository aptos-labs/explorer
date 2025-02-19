import {Types} from "aptos";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import {getAccountResources} from "../index";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetAccountResources(
  address: string,
  options?: {
    retry?: number | boolean;
  },
): UseQueryResult<Types.MoveResource[], ResponseError> {
  const [state] = useGlobalState();

  return useQuery<Array<Types.MoveResource>, ResponseError>({
    queryKey: ["accountResources", {address}, state.network_value],
    queryFn: () => getAccountResources({address}, state.aptos_client),
    retry: options?.retry ?? false,
  });
}
