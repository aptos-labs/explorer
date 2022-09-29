import {Types} from "aptos";
import {useQuery} from "react-query";
import {getBlockByHeight, getBlockByVersion} from "../../api";
import {ResponseError} from "../../api/client";
import {useGlobalState} from "../../GlobalState";

export function useGetBlockByHeight(height: number) {
  const [state, _setState] = useGlobalState();

  const result = useQuery<Types.Block, ResponseError>(
    ["block", height, state.network_value],
    () => getBlockByHeight(height, state.network_value),
  );

  return result;
}

export function useGetBlockByVersion(version: number) {
  const [state, _setState] = useGlobalState();

  const result = useQuery<Types.Block, ResponseError>(
    ["block", version, state.network_value],
    () => getBlockByVersion(version, state.network_value),
  );

  return result;
}
