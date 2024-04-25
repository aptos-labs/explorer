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

  const result = useQuery<Types.AccountData, ResponseError>(
    ["account", {address}, state.network_value],
    () => getAccount({address}, state.network_value),
    options,
  );

  return result;
}
