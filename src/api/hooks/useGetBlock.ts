import {Types} from "aptos";
import {useQuery} from "@tanstack/react-query";
import {getBlockByHeight, getBlockByVersion} from "../../api";
import {ResponseError} from "../../api/client";
import {useGlobalState} from "../../global-config/GlobalConfig";

export function useGetBlockByHeight({
  height,
  withTransactions = true,
}: {
  height: number;
  withTransactions?: boolean;
}) {
  const [state, _setState] = useGlobalState();

  const result = useQuery<Types.Block, ResponseError>(
    ["block", height, state.network_value],
    () => getBlockByHeight({height, withTransactions}, state.network_value),
  );

  return result;
}

export function useGetBlockByVersion({
  version,
  withTransactions = true,
}: {
  version: number;
  withTransactions?: boolean;
}) {
  const [state, _setState] = useGlobalState();

  const result = useQuery<Types.Block, ResponseError>(
    ["block", version, state.network_value],
    () => getBlockByVersion({version, withTransactions}, state.network_value),
  );

  return result;
}
