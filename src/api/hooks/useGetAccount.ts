import {Types} from "aptos";
import {useQuery} from "@tanstack/react-query";
import {getAccount} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetAccount(
  address: string,
  options?: {retry?: number | boolean},
) {
  const [state] = useGlobalState();

  return useQuery<Types.AccountData, ResponseError>({
    queryKey: ["account", {address}, state.network_value],
    queryFn: () => getAccount({address}, state.aptos_client),
    retry: options?.retry ?? false,
    // Account data is semi-static - cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}
