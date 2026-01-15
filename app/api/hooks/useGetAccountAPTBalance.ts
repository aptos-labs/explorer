import {Types} from "aptos";
import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {getBalance} from "../index";
import {useNetworkValue, useSdkV2Client} from "../../global-config";

export function useGetAccountAPTBalance(address: Types.Address) {
  const networkValue = useNetworkValue();
  const sdkV2Client = useSdkV2Client();
  // TODO: Convert all Types.Address to AccountAddress
  return useQuery<string, ResponseError>({
    queryKey: ["aptBalance", {address}, networkValue],
    queryFn: () => getBalance(sdkV2Client, address),
    retry: false,
    // Balance changes frequently but not in real-time - cache for 30 seconds
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}
