import {CoinDescription} from "../../api/hooks/useGetCoinList";

/**
 * Hardcoded coin/asset metadata for Devnet
 * These override or supplement data from external APIs
 */
export const devnetHardCodedCoins: Record<string, CoinDescription> = {
  "0x1::aptos_coin::AptosCoin": {
    chainId: 148, // Devnet chainId
    tokenAddress: "0x1::aptos_coin::AptosCoin",
    faAddress: "0xa",
    name: "Aptos Coin",
    symbol: "APT",
    decimals: 8,
    panoraSymbol: "APT",
    bridge: null,
    logoUrl: "https://assets.panora.exchange/tokens/aptos/APT.svg",
    websiteUrl: "https://aptosfoundation.org",
    category: "Native",
    isInPanoraTokenList: true,
    panoraUI: true,
    usdPrice: null,
    panoraTags: ["Native"],
    isBanned: false,
    panoraOrderIndex: 1,
    panoraIndex: 1,
    coinGeckoId: null, // No price tracking on devnet
    coinMarketCapId: null,
    native: true,
  },
};

/**
 * Native token addresses for Devnet
 */
export const devnetNativeTokens: Record<string, string> = {
  "0x1::aptos_coin::AptosCoin": "APT",
  "0x000000000000000000000000000000000000000000000000000000000000000a": "APT",
  "0x000000000000000000000000000000000000000000000000000000000000000A": "APT",
  "0xa": "APT",
  "0xA": "APT",
};

/**
 * Verified tokens for Devnet
 */
export const devnetVerifiedTokens: Record<string, string> = {
  // Add devnet-specific verified tokens here
};

/**
 * Banned tokens for Devnet
 */
export const devnetBannedTokens: Record<string, string> = {
  // Devnet doesn't need banned tokens
};

/**
 * Banned addresses for Devnet
 */
export const devnetBannedAddresses: Record<string, string> = {};

/**
 * Banned token symbols for Devnet
 */
export const devnetBannedTokenSymbols: Record<string, string> = {};

/**
 * Banned collections for Devnet
 */
export const devnetBannedCollections: Record<string, string> = {};

/**
 * Supply limit overrides for Devnet
 */
export const devnetSupplyLimitOverrides: Record<string, bigint> = {};
