import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {tryStandardizeAddress} from "../../utils";
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
    // TODO: Type this correctly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: async (): Promise<any> => {
      const end_point = "https://api.panora.exchange/tokenlist";

      const query = {
        panoraUI: "true, false",
      };

      const headers = {
        "x-api-key": // public key from their docs page
          "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi",
      };

      const queryString = new URLSearchParams(query);
      const url = `${end_point}?${queryString}`;

      const ret: {data: CoinDescription[]} = await (
        await fetch(url, {
          method: "GET",
          headers: headers,
        })
      ).json();

      // Merge hardcoded coins with the fetched coins only adding missing
      // TODO: Probably provide a list for bad internet connections / rate limiting
      const hardcodedKeys = Object.keys(HardCodedCoins).filter((key) => {
        return !ret.data.find((coin) => {
          return (
            coin.tokenAddress === key ||
            tryStandardizeAddress(coin.faAddress) === key
          );
        });
      });

      // Any that don't exist, add them (and at the beginning)
      const newData: CoinDescription[] = [];
      hardcodedKeys.forEach((key) => {
        newData.push(HardCodedCoins[key]);
      });
      ret.data = newData.concat(ret.data);

      return ret;
    },
    retry: options?.retry ?? false,
  });
}
