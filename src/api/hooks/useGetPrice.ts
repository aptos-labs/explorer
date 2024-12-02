import {useQuery} from "@tanstack/react-query";

const COINGECKO_API_ENDPOINT = "https://api.coingecko.com/api/v3/simple/price";

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
  const query = {
    ids: coinId,
    vs_currencies: "usd",
  };

  const queryString = new URLSearchParams(query);
  const url = `${COINGECKO_API_ENDPOINT}?${queryString}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
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
