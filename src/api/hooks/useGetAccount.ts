import {Types} from "aptos";
import {useQuery} from "react-query";
import {getAccount} from "..";
import {ResponseError} from "../client";
import {useGlobalState} from "../../GlobalState";

export function useGetAccount(address: string) {
  const [state, _setState] = useGlobalState();

  const result = useQuery<Types.AccountData, ResponseError>(
    ["account", {address}, state.network_value],
    () => getAccount({address}, state.network_value),
  );

  return result;
}
