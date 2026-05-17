import {useQuery} from "@tanstack/react-query";
import {resolveCoingeckoUrl} from "./coingeckoProxy";

/**
 * Fetches the USD price for a cryptocurrency using its CoinGecko ID.
 *
 * Common CoinGecko IDs:
 * - "aptos" : Aptos (APT)
 * - "bitcoin": Bitcoin (BTC)
 * - "ethereum": Ethereum (ETH)
 * - "solana": Solana (SOL)
 * - "binancecoin": Binance Coin (BNB)
 * - "cardano": Cardano (ADA)
 *
 * Complete list of supported IDs:
 * https://api.coingecko.com/api/v3/coins/list
 *
 * @param coinId - The CoinGecko ID of the cryptocurrency (defaults to "aptos")
 * @returns The USD price of the cryptocurrency or null if the price fetch fails
 */
export async function getPrice(
  coinId: string = "aptos",
): Promise<number | null> {
  const query = new URLSearchParams({
    ids: coinId,
    vs_currencies: "usd",
  });
  const url = resolveCoingeckoUrl("price", "/simple/price", query.toString());

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return Number(data[coinId].usd);
  } catch (error) {
    console.error(`Error fetching ${coinId} price from CoinGecko:`, error);
    return null;
  }
}

/**
 * Fetches the USD price for a cryptocurrency using its CoinGecko ID.
 *
 * @param coinId - The CoinGecko ID of the cryptocurrency (defaults to "aptos")
 * @returns React Query result object containing the price data and query state
 */
export function useGetPrice(coinId: string = "aptos") {
  return useQuery({
    queryKey: ["price", coinId],
    queryFn: () => getPrice(coinId),
  });
}
