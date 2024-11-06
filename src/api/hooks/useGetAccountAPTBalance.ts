import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {getBalance} from "../v2";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {AccountAddressInput} from "@aptos-labs/ts-sdk";

export function useGetAccountAPTBalance(address: AccountAddressInput) {
  const [state] = useGlobalState();
  // TODO: Convert all Types.Address to AccountAddress
  return useQuery<string, ResponseError>({
    queryKey: ["aptBalance", {address}, state.network_value],
    queryFn: () => getBalance(state.sdk_v2_client, address),
    retry: false,
  });
}
