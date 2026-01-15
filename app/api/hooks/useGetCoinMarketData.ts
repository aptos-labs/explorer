import {useQuery} from "@tanstack/react-query";
import {useMemo} from "react";
import {CoinDescription} from "./useGetCoinList";

const COINGECKO_API_ENDPOINT = "https://api.coingecko.com/api/v3/coins/markets";

// Rate limiting: CoinGecko free tier allows 10-50 calls/minute
// We add a delay between batch requests to avoid hitting rate limits
const BATCH_DELAY_MS = 1500;

export type CoinMarketData = {
  id: string;
  current_price: number | null;
  market_cap: number | null;
  total_supply: number | null;
  circulating_supply: number | null;
  price_change_percentage_24h: number | null;
};

export type CoinMarketDataResult = {
  data: Record<string, CoinMarketData>;
  errors: string[];
};

// Helper to delay execution
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches market data (price, market cap, supply) for multiple coins from CoinGecko.
 * Returns a map of coinGeckoId -> market data for easy lookup, along with any errors.
 *
 * Note: CoinGecko free tier has rate limits (10-50 calls/minute).
 * This function implements delays between batch requests to avoid rate limiting.
 */
export async function getCoinMarketData(
  coinGeckoIds: string[],
): Promise<CoinMarketDataResult> {
  if (coinGeckoIds.length === 0) {
    return {data: {}, errors: []};
  }

  // CoinGecko limits to 250 coins per request
  const batchSize = 250;
  const results: Record<string, CoinMarketData> = {};
  const errors: string[] = [];

  for (let i = 0; i < coinGeckoIds.length; i += batchSize) {
    // Add delay between batches to respect rate limits (skip for first batch)
    if (i > 0) {
      await delay(BATCH_DELAY_MS);
    }

    const batch = coinGeckoIds.slice(i, i + batchSize);
    const query = {
      vs_currency: "usd",
      ids: batch.join(","),
      order: "market_cap_desc",
      per_page: batchSize.toString(),
      page: "1",
      sparkline: "false",
    };

    const queryString = new URLSearchParams(query);
    const url = `${COINGECKO_API_ENDPOINT}?${queryString}`;

    try {
      const response = await fetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        const errorMsg = `CoinGecko API error: ${response.status}${response.status === 429 ? " (rate limited)" : ""}`;
        console.error(errorMsg);
        errors.push(errorMsg);

        // If rate limited, wait longer before next request
        if (response.status === 429) {
          await delay(BATCH_DELAY_MS * 2);
        }
        continue;
      }

      const data: CoinMarketData[] = await response.json();
      for (const coin of data) {
        results[coin.id] = coin;
      }
    } catch (error) {
      const errorMsg = `Error fetching CoinGecko market data: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }

  return {data: results, errors};
}

/**
 * Hook to fetch market data for coins that have a CoinGecko ID.
 * Returns a map of coinGeckoId -> market data, along with loading and error states.
 */
export function useGetCoinMarketData(coins: CoinDescription[]) {
  // Extract unique CoinGecko IDs from the coin list and sort them for stable query key
  const sortedUniqueIds = useMemo(() => {
    const coinGeckoIds = coins
      .map((coin) => coin.coinGeckoId)
      .filter((id): id is string => id !== null && id !== undefined);

    return [...new Set(coinGeckoIds)].sort();
  }, [coins]);

  const queryResult = useQuery<CoinMarketDataResult>({
    queryKey: ["coinMarketData", sortedUniqueIds.join(",")],
    queryFn: () => getCoinMarketData(sortedUniqueIds),
    enabled: sortedUniqueIds.length > 0,
    // Market data is somewhat dynamic - cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    // Retry once on failure with delay
    retry: 1,
    retryDelay: 3000,
  });

  return {
    data: queryResult.data?.data,
    errors: queryResult.data?.errors ?? [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
  };
}
