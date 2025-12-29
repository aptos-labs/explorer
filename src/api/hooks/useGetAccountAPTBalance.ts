import {Types} from "aptos";
import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {getBalance} from "../index";
import {
  useNetworkValue,
  useSdkV2Client,
} from "../../global-config/GlobalConfig";

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
