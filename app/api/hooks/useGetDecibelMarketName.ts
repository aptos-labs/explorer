import {useQuery} from "@tanstack/react-query";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {DECIBEL_CONTRACTS} from "../../utils/decibel";

const PERP_MARKET_CONFIG_TYPE = "::perp_market_config::PerpMarketConfiguration";

export type DecibelMarketConfig = {
  name: string | undefined;
  szDecimals: number | undefined;
  tickerSize: number | undefined;
};

function fetchMarketConfig(
  aptosClient: ReturnType<typeof useAptosClient>,
  marketAddress: string,
): () => Promise<DecibelMarketConfig> {
  return async () => {
    for (const addr of DECIBEL_CONTRACTS) {
      try {
        const resource = await aptosClient.getAccountResource(
          marketAddress,
          `${addr}${PERP_MARKET_CONFIG_TYPE}`,
        );
        const data = resource.data as {
          info?: {name?: string; sz_decimals?: string; ticker_size?: string};
        };
        const szDec = data?.info?.sz_decimals;
        const ticker = data?.info?.ticker_size;
        return {
          name: data?.info?.name ?? undefined,
          szDecimals: szDec !== undefined ? Number(szDec) : undefined,
          tickerSize: ticker !== undefined ? Number(ticker) : undefined,
        };
      } catch {
        // Try next contract address
      }
    }
    return {name: undefined, szDecimals: undefined, tickerSize: undefined};
  };
}

export function useGetDecibelMarketName(marketAddress: string): {
  isLoading: boolean;
  data: string | undefined;
} {
  const config = useGetDecibelMarketConfig(marketAddress);
  return {isLoading: config.isLoading, data: config.data?.name};
}

export function useGetDecibelMarketConfig(marketAddress: string): {
  isLoading: boolean;
  data: DecibelMarketConfig | undefined;
} {
  const aptosClient = useAptosClient();
  const networkValue = useNetworkValue();

  const query = useQuery({
    queryKey: ["decibelMarketConfig", marketAddress, networkValue],
    queryFn: fetchMarketConfig(aptosClient, marketAddress),
    enabled: !!marketAddress,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {isLoading: query.isLoading, data: query.data ?? undefined};
}
