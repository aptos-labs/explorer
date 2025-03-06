import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {HardCodedCoins} from "../../constants";

export type CoinDescription = {
  chainId: number; // Chain id (1 if mainnet) TODO: Handle across all of explorer to filter based on testnet / mainnet
  tokenAddress: string | null; // This is a coin address (if it exists)
  faAddress: string | null; // This is the FA address (if it exists)
  name: string; // Full name of the coin
  symbol: string; // symbol of coin
  decimals: number; // number of decimals (u8)
  bridge: string | null; // bridge name it came from if applicable
  panoraSymbol: string | null; // panora symbol (to handle bridged tokens)
  logoUrl: string; // Logo URL of the token
  websiteUrl: string | null; // Website URL of the token
  category: string; // Category of the token, which is not always filled
  panoraUI: boolean; // This is whether it shows at all on the panora UI
  isInPanoraTokenList: boolean; // This is whether it shows on panora, not usually necessary
  isBanned: boolean; // if it's banned by panora
  panoraOrderIndex?: number; // Order index in panora (doesn't look like it still applies)
  panoraIndex?: number; // Order index in panora (replaced panoraOrderIndex)
  coinGeckoId: string | null; // Pricing source info
  coinMarketCapId: number | null; // Pricing source info
  usdPrice: string | null; // Decimal string of the USD price
  panoraTags: (
    | "Native"
    | "Bridged"
    | "Emojicoin"
    | "Meme"
    | "Verified"
    | "Recognized"
    | "Unverified"
    | "Banned"
    | "InternalFA"
    | "LP"
  )[]; // Kind of coin
  native?: boolean; // Added for our own purposes, not from Panora
};

export function useGetCoinList(options?: {retry?: number | boolean}) {

  return useQuery<{data: CoinDescription[]}, ResponseError>({
    queryKey: ["coinList"],
    queryFn: async (): Promise<{data: CoinDescription[]}> => {
      const hardcodedCoins = Object.values(HardCodedCoins);
      const coinGeckoIds = hardcodedCoins.map((coin) => coin.coinGeckoId).filter((id) => id !== null);

      const end_point = "https://api.coingecko.com/api/v3/simple/price";

      const query = {
        vs_currencies: "usd",
        ids: coinGeckoIds.join(","),
      };

      const queryString = new URLSearchParams(query);
      const url = `${end_point}?${queryString}`;

      const ret: {movement: {usd: number}} = await (
        await fetch(url, {
          method: "GET",
        })
      ).json();
      
      hardcodedCoins.forEach((coin) => {
        if (coin.coinGeckoId) {
          const priceData = ret[coin.coinGeckoId as keyof typeof ret];
          coin.usdPrice = priceData?.usd?.toString() ?? null;
        }
        return coin;
      });

      return { data: hardcodedCoins };
    },
    retry: options?.retry ?? false,
  });
}
