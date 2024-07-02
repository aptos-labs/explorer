import {useQuery} from "@tanstack/react-query";
import {getAccount} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {AccountAddress, AccountData} from "@aptos-labs/ts-sdk";

export function useGetAccount(
  address: string,
  options?: {retry?: number | boolean},
) {
  const [state] = useGlobalState();

  const result = useQuery<AccountData, ResponseError>({
    queryKey: ["account", {address}, state.network_value],
    queryFn: () =>
      getAccount({address: AccountAddress.from(address)}, state.sdk_v2_client),
    retry: options?.retry ?? false,
  });

  return result;
}
