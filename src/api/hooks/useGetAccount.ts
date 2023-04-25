import {Types} from "aptos";
import {useQuery} from "@tanstack/react-query";
import {getAccount} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetAccount(address: string) {
  const [state, _setState] = useGlobalState();

  const result = useQuery<Types.AccountData, ResponseError>(
    ["account", {address}, state.network_value],
    () => getAccount({address}, state.network_value),
  );

  return result;
}
