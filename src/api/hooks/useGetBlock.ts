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
  const [state] = useGlobalState();

  const result = useQuery<Types.Block, ResponseError>({
    queryKey: ["block", height, state.network_value],
    queryFn: () =>
      getBlockByHeight({height, withTransactions}, state.aptos_client),
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

  const result = useQuery<Types.Block, ResponseError>({
    queryKey: ["block", version, state.network_value],
    queryFn: () =>
      getBlockByVersion({version, withTransactions}, state.aptos_client),
  });

  return result;
}
