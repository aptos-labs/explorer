import {Types} from "aptos";
import {useQuery} from "react-query";
import {getBlockByHeight, getBlockByVersion} from "../../api";
import {ResponseError} from "../../api/client";
import {useGlobalState} from "../../GlobalState";

export function useGetBlockByHeight(height: number, withTransactions = true) {
  const [state, _setState] = useGlobalState();

  const result = useQuery<Types.Block, ResponseError>(
    ["block", height, state.network_value],
    () => getBlockByHeight(height, withTransactions, state.network_value),
  );

  return result;
}

export function useGetBlockByVersion(version: number, withTransactions = true) {
  const [state, _setState] = useGlobalState();

  const result = useQuery<Types.Block, ResponseError>(
    ["block", version, state.network_value],
    () => getBlockByVersion(version, withTransactions, state.network_value),
  );

  return result;
}
