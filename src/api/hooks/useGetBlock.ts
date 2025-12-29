import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../../api/client";
import {
  useNetworkValue,
  useSdkV2Client,
} from "../../global-config/GlobalConfig";
import {getBlockByHeight, getBlockByVersion} from "../v2";
import {Block} from "@aptos-labs/ts-sdk";

export function useGetBlockByHeight({
  height,
  withTransactions = true,
}: {
  height: number;
  withTransactions?: boolean;
}) {
  const networkValue = useNetworkValue();
  const sdkV2Client = useSdkV2Client();

  return useQuery<Block, ResponseError>({
    queryKey: ["block", height, networkValue],
    queryFn: () => getBlockByHeight({height, withTransactions}, sdkV2Client),
    refetchInterval: 1200000,
    // Block data is relatively static once confirmed
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

export function useGetBlockByVersion({
  version,
  withTransactions = true,
}: {
  version: number;
  withTransactions?: boolean;
}) {
  const networkValue = useNetworkValue();
  const sdkV2Client = useSdkV2Client();

  return useQuery<Block, ResponseError>({
    queryKey: ["block", version, networkValue],
    queryFn: () => getBlockByVersion({version, withTransactions}, sdkV2Client),
    // Block by version is static - cache longer
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });
}
