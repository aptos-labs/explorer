import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";

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
};

export function useGetCoinList(options?: {retry?: number | boolean}) {
  return useQuery<{data: CoinDescription[]}, ResponseError>({
    queryKey: ["coinList"],
    queryFn: async (): Promise<any> => {
      const end_point = "https://api.panora.exchange/tokenlist";

      const query = {};

      const headers = {
        "x-api-key":
          "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi",
      };

      const queryString = new URLSearchParams(query);
      const url = `${end_point}?${queryString}`;

      const ret = await (
        await fetch(url, {
          method: "GET",
          headers: headers,
        })
      ).json();
      return ret;
    },
    retry: options?.retry ?? false,
  });
}
