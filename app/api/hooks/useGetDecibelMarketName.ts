import {useQuery} from "@tanstack/react-query";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {DECIBEL_CONTRACTS} from "../../utils/decibel";

const PERP_MARKET_CONFIG_TYPE = "::perp_market_config::PerpMarketConfiguration";

export function useGetDecibelMarketName(marketAddress: string): {
  isLoading: boolean;
  data: string | undefined;
} {
  const aptosClient = useAptosClient();
  const networkValue = useNetworkValue();

  const query = useQuery({
    queryKey: ["decibelMarketName", marketAddress, networkValue],
    queryFn: async () => {
      // Try each contract address (mainnet and testnet) until one works
      for (const addr of DECIBEL_CONTRACTS) {
        try {
          const resource = await aptosClient.getAccountResource(
            marketAddress,
            `${addr}${PERP_MARKET_CONFIG_TYPE}`,
          );
          const data = resource.data as {
            info?: {name?: string};
          };
          return data?.info?.name ?? undefined;
        } catch {
          // Try next contract address
        }
      }
      return undefined;
    },
    enabled: !!marketAddress,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {isLoading: query.isLoading, data: query.data ?? undefined};
}
