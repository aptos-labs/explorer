import {useQuery} from "@tanstack/react-query";
import {getAccount} from "../../v2";
import {ResponseError} from "../../client";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {AccountData} from "@aptos-labs/ts-sdk";

export function useGetAccount(
  address: string,
  options?: {retry?: number | boolean},
) {
  const [state] = useGlobalState();

  return useQuery<AccountData, ResponseError>({
    queryKey: ["account", {address}, state.network_value],
    queryFn: () => getAccount({address}, state.sdk_v2_client),
    retry: options?.retry ?? false,
  });
}
