import {useQuery} from "@tanstack/react-query";
import {getBlockByHeight, getBlockByVersion} from "../../api";
import {ResponseError} from "../../api/client";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {Block} from "@aptos-labs/ts-sdk";

export function useGetBlockByHeight({
  height,
  withTransactions = true,
}: {
  height: number;
  withTransactions?: boolean;
}) {
  const [state] = useGlobalState();

  const result = useQuery<Block, ResponseError>({
    queryKey: ["block", height, state.network_value],
    queryFn: () =>
      getBlockByHeight({height, withTransactions}, state.sdk_v2_client),
  });

  return result;
}

export function useGetBlockByVersion({
  version,
  withTransactions = true,
}: {
  version: number;
  withTransactions?: boolean;
}) {
  const [state] = useGlobalState();

  const result = useQuery<Block, ResponseError>({
    queryKey: ["block", version, state.network_value],
    queryFn: () =>
      getBlockByVersion({version, withTransactions}, state.sdk_v2_client),
  });

  return result;
}
