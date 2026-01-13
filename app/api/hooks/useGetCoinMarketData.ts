import {useQuery} from "@tanstack/react-query";
import {CoinDescription} from "./useGetCoinList";

const COINGECKO_API_ENDPOINT = "https://api.coingecko.com/api/v3/coins/markets";

export type CoinMarketData = {
  id: string;
  current_price: number | null;
  market_cap: number | null;
  total_supply: number | null;
  circulating_supply: number | null;
  price_change_percentage_24h: number | null;
};

/**
 * Fetches market data (price, market cap, supply) for multiple coins from CoinGecko.
 * Returns a map of coinGeckoId -> market data for easy lookup.
 */
export async function getCoinMarketData(
  coinGeckoIds: string[],
): Promise<Record<string, CoinMarketData>> {
  if (coinGeckoIds.length === 0) {
    return {};
  }

  // CoinGecko limits to 250 coins per request
  const batchSize = 250;
  const results: Record<string, CoinMarketData> = {};

  for (let i = 0; i < coinGeckoIds.length; i += batchSize) {
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
        console.error(`CoinGecko API error: ${response.status}`);
        continue;
      }

      const data: CoinMarketData[] = await response.json();
      for (const coin of data) {
        results[coin.id] = coin;
      }
    } catch (error) {
      console.error("Error fetching CoinGecko market data:", error);
    }
  }

  return results;
}

/**
 * Hook to fetch market data for coins that have a CoinGecko ID.
 * Returns a map of coinGeckoId -> market data.
 */
export function useGetCoinMarketData(coins: CoinDescription[]) {
  // Extract unique CoinGecko IDs from the coin list
  const coinGeckoIds = coins
    .map((coin) => coin.coinGeckoId)
    .filter((id): id is string => id !== null && id !== undefined);

  const uniqueIds = [...new Set(coinGeckoIds)];

  return useQuery<Record<string, CoinMarketData>>({
    queryKey: ["coinMarketData", uniqueIds.sort().join(",")],
    queryFn: () => getCoinMarketData(uniqueIds),
    enabled: uniqueIds.length > 0,
    // Market data is somewhat dynamic - cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
