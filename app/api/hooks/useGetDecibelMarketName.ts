import {useQuery} from "@tanstack/react-query";
import {useAptosClient, useNetworkValue} from "../../global-config";
import {DECIBEL_CONTRACTS} from "../../utils/decibel";

const PERP_MARKET_CONFIG_TYPE = "::perp_market_config::PerpMarketConfiguration";

const PRICE_DECIMALS = 6;

export type DecibelMarketConfig = {
  name: string | undefined;
  baseAsset: string | undefined;
  quoteAsset: string | undefined;
  szDecimals: number;
  priceDecimals: number;
};

type PerpMarketConfigResource = {
  info?: {name?: string};
  precision?: {
    sz_precision?: {decimals?: number};
    ticker_size?: string;
  };
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
        const data = resource.data as PerpMarketConfigResource;
        const name = data?.info?.name ?? undefined;
        const szDec = data?.precision?.sz_precision?.decimals;
        const [baseAsset, quoteAsset] = name?.includes("/")
          ? name.split("/", 2)
          : [undefined, undefined];
        return {
          name,
          baseAsset,
          quoteAsset,
          szDecimals: szDec ?? 0,
          priceDecimals: PRICE_DECIMALS,
        };
      } catch {
        // Try next contract address
      }
    }
    return {
      name: undefined,
      baseAsset: undefined,
      quoteAsset: undefined,
      szDecimals: 0,
      priceDecimals: PRICE_DECIMALS,
    };
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
