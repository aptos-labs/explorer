import {useQuery} from "@tanstack/react-query";
import {getBalance} from "~/api";
import type {ResponseError} from "~/api/client";
import {useNetworkValue, useSdkV2Client} from "~/global-config";
import type {Types} from "~/types/aptos";

export function useGetAccountAPTBalance(address: Types.Address) {
  const networkValue = useNetworkValue();
  const sdkV2Client = useSdkV2Client();
  // TODO: Convert all Types.Address to AccountAddress
  return useQuery<string, ResponseError>({
    queryKey: ["aptBalance", {address}, networkValue],
    queryFn: () => getBalance(sdkV2Client, address),
    retry: false,
  });
}
