import {useQuery} from "@tanstack/react-query";
import {useMemo} from "react";
import {getHardCodedCoins} from "../../data";
import {useNetworkName} from "../../global-config/GlobalConfig";
import type {NetworkName} from "../../lib/constants";
import {tryStandardizeAddress} from "../../utils";
import type {ResponseError} from "../client";

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

/** Hardcoded coins for a network (always available without Panora). */
export function getBaselineCoinList(
  networkName: NetworkName,
): CoinDescription[] {
  return Object.values(getHardCodedCoins(networkName));
}

function hardcodedCoinMatchesKey(coin: CoinDescription, key: string): boolean {
  const standardizedKey = tryStandardizeAddress(key);
  if (coin.tokenAddress === key) {
    return true;
  }
  if (!coin.faAddress || !standardizedKey) {
    return false;
  }
  return tryStandardizeAddress(coin.faAddress) === standardizedKey;
}

/** Panora list with network hardcoded coins prepended when missing from the API. */
export function mergePanoraWithHardcodedCoins(
  networkName: NetworkName,
  panoraCoins: CoinDescription[],
): CoinDescription[] {
  const hardCodedCoins = getHardCodedCoins(networkName);
  const hardcodedKeys = Object.keys(hardCodedCoins).filter((key) => {
    return !panoraCoins.some((coin) => hardcodedCoinMatchesKey(coin, key));
  });

  const prepend: CoinDescription[] = [];
  for (const key of hardcodedKeys) {
    prepend.push(hardCodedCoins[key]);
  }
  return prepend.concat(panoraCoins);
}

function baselineCoinListQueryData(networkName: NetworkName): {
  data: CoinDescription[];
} {
  return {data: getBaselineCoinList(networkName)};
}

/**
 * Fetch coin list from Panora API with network-specific hardcoded coins
 * Note: Panora API is mainnet-only, so testnet/devnet will only show hardcoded coins
 */
export function useGetCoinList(options?: {retry?: number | boolean}) {
  const networkName = useNetworkName();
  const baselineData = useMemo(
    () => baselineCoinListQueryData(networkName),
    [networkName],
  );

  return useQuery<{data: CoinDescription[]}, ResponseError>({
    queryKey: ["coinList", networkName],
    queryFn: async (): Promise<{data: CoinDescription[]}> => {
      const hardCodedCoins = getHardCodedCoins(networkName);

      // Only fetch from Panora on mainnet (Panora doesn't have testnet/devnet data)
      if (networkName !== "mainnet") {
        // Return only hardcoded coins for non-mainnet networks
        return {data: Object.values(hardCodedCoins)};
      }

      try {
        const end_point = "https://api.panora.exchange/tokenlist";

        const query = {
          panoraUI: "true, false",
        };

        const headers = {
          // public key from their docs page
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

        return {
          data: mergePanoraWithHardcodedCoins(networkName, ret.data ?? []),
        };
      } catch {
        return baselineData;
      }
    },
    placeholderData: baselineData,
    retry: options?.retry ?? false,
    // Coin list is static metadata - cache for 1 hour
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    refetchOnWindowFocus: false,
  });
}

/**
 * Non-hook version for use outside of React components
 * Requires network name to be passed explicitly
 */
export function getCoinListForNetwork(
  networkName: NetworkName,
): CoinDescription[] {
  return getBaselineCoinList(networkName);
}
