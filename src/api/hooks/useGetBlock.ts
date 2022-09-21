import {Types} from "aptos";
import {useQuery} from "react-query";
import {getBlockByHeight} from "../../api";
import {ResponseError} from "../../api/client";
import {useGlobalState} from "../../GlobalState";

export function useGetBlockByHeight(height: string) {
  const [state, _setState] = useGlobalState();

  const result = useQuery<Types.Block, ResponseError>(
    ["block", height, state.network_value],
    () => getBlockByHeight(parseInt(height), state.network_value),
  );

  return result;
}
