import {useQuery} from "@tanstack/react-query";
import {getBlockByHeight, getBlockByVersion} from "../../v2";
import {ResponseError} from "../../client";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {Block} from "@aptos-labs/ts-sdk";

export function useGetBlockByHeight({
  height,
  withTransactions = true,
}: {
  height: number;
  withTransactions?: boolean;
}) {
  const [state] = useGlobalState();

  return useQuery<Block, ResponseError>({
    queryKey: ["block", height, state.network_value],
    queryFn: () =>
      getBlockByHeight({height, withTransactions}, state.sdk_v2_client),
  });
}

export function useGetBlockByVersion({
  version,
  withTransactions = true,
}: {
  version: number;
  withTransactions?: boolean;
}) {
  const [state] = useGlobalState();

  return useQuery<Block, ResponseError>({
    queryKey: ["block", version, state.network_value],
    queryFn: () =>
      getBlockByVersion({version, withTransactions}, state.sdk_v2_client),
  });
}
