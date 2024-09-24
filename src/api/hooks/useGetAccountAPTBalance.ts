import {Types} from "aptos";
import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {getBalance} from "../index";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetAccountAPTBalance(address: Types.Address) {
  const [state] = useGlobalState();
  // TODO: Convert all Types.Address to AccountAddress
  return useQuery<string, ResponseError>({
    queryKey: ["aptBalance", {address}, state.network_value],
    queryFn: () => getBalance(state.sdk_v2_client!, address),
    retry: false,
  });
}
