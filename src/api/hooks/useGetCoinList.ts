import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../client";
import {tryStandardizeAddress} from "../../utils";

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

// This provides a way to hardcode coins that are not in the token list, but still
// have functionality used elsewhere
export const HardCodedCoins: Record<string, CoinDescription> = {
  "0x1::aptos_coin::AptosCoin": {
    chainId: 1,
    tokenAddress: "0x1::aptos_coin::AptosCoin",
    faAddress: "0xa",
    name: "Aptos Coin",
    symbol: "APT",
    decimals: 8,
    panoraSymbol: "APT",
    bridge: null,
    logoUrl:
      "https://raw.githubusercontent.com/PanoraExchange/Aptos-Tokens/main/logos/APT.svg",
    websiteUrl: "https://aptosfoundation.org",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 1,
    coinGeckoId: "aptos",
    coinMarketCapId: 21794,
    native: true,
  },
  "0xd39fcd33aedfd436a1bbb576a48d5c7c0ac317c9a9bb7d53ae9ffb41e8cb9fd9": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xd39fcd33aedfd436a1bbb576a48d5c7c0ac317c9a9bb7d53ae9ffb41e8cb9fd9",
    name: "Find Out Points",
    symbol: "FFO",
    decimals: 8,
    panoraSymbol: null,
    bridge: null,
    logoUrl: "",
    websiteUrl: "https://www.letsfindout.ai/",
    category: "Native",
    isInPanoraTokenList: false,
    isBanned: false,
    panoraOrderIndex: 999999999,
    coinGeckoId: null,
    coinMarketCapId: null,
  },
  "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
    name: "Tether USD",
    symbol: "USDt", // Turns out USDt is the symbol when unicode USD₮ is not supported
    decimals: 6,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://tether.to/images/logoCircle.svg",
    websiteUrl: "https://tether.to",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 2,
    coinGeckoId: "tether",
    coinMarketCapId: 825,
    native: true,
  },
  "0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89",
    name: "BlackRock BUIDL",
    symbol: "BUIDL",
    decimals: 6,
    panoraSymbol: null,
    bridge: null,
    logoUrl:
      "https://securitize-public-files.s3.us-east-2.amazonaws.com/ClientDocuments/buidl/token-logo-256.png",
    websiteUrl: "http://securitize.io/blackrock/BUIDL",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 3,
    coinGeckoId: "blackrock-usd-institutional-digital-liquidity-fund",
    coinMarketCapId: null,
  },
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
