import {useQuery} from "@tanstack/react-query";
import type {Types} from "~/types/aptos";
import {useNetworkValue, useSdkV2Client} from "../../global-config";
import {aptBalanceQueryOptions} from "../queries";

export function useGetAccountAPTBalance(address: Types.Address) {
  const networkValue = useNetworkValue();
  const sdkV2Client = useSdkV2Client();
  return useQuery({
    ...aptBalanceQueryOptions(address, sdkV2Client, networkValue),
    enabled: !!address,
  });
}
