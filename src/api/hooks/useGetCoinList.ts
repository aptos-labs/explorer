import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {tryStandardizeAddress} from "../../utils";
import {HardCodedCoins} from "../../constants";

export type CoinDescription = {
  chainId: number;
  tokenAddress: string | null;
  faAddress: string | null;
  name: string;
  symbol: string;
  decimals: number;
  bridge: string | null;
  panoraSymbol: string | null;
  logoUrl: string;
  websiteUrl: string | null;
  category: string;
  isInPanoraTokenList: boolean;
  isBanned: boolean;
  panoraOrderIndex: number;
  coinGeckoId: string | null;
  coinMarketCapId: number | null;
  native?: boolean;
};

export function useGetCoinList(options?: {retry?: number | boolean}) {
  return useQuery<{data: CoinDescription[]}, ResponseError>({
    queryKey: ["coinList"],
    queryFn: async (): Promise<any> => {
      const end_point = "https://api.panora.exchange/tokenlist";

      const query = {
        panoraUI: "true, false",
      };

      const headers = {
        "x-api-key":
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
