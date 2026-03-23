import {useQuery} from "@tanstack/react-query";
import type {NetworkName} from "~/lib/constants";
import {
  fetchSentioCallTrace,
  getSentioCallTraceNetworkId,
} from "~/utils/sentioCallTrace";

export function useSentioCallTrace(opts: {
  networkName: NetworkName;
  txHash: string;
  enabled: boolean;
}) {
  const networkId = getSentioCallTraceNetworkId(opts.networkName);

  return useQuery({
    queryKey: ["sentioCallTrace", opts.networkName, opts.txHash],
    queryFn: async ({signal}) => {
      if (networkId === undefined) {
        throw new Error("Unsupported network for Sentio call trace");
      }
      return fetchSentioCallTrace(networkId, opts.txHash, signal);
    },
    enabled: Boolean(opts.enabled && networkId !== undefined && opts.txHash),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
