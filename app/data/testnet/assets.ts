import {CoinDescription} from "../../api/hooks/useGetCoinList";

/**
 * Hardcoded coin/asset metadata for Testnet
 * These override or supplement data from external APIs
 */
export const testnetHardCodedCoins: Record<string, CoinDescription> = {
  "0x1::aptos_coin::AptosCoin": {
    chainId: 2, // Testnet chainId
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
    coinGeckoId: null, // No price tracking on testnet
    coinMarketCapId: null,
    native: true,
  },
};

/**
 * Native token addresses for Testnet
 */
export const testnetNativeTokens: Record<string, string> = {
  "0x1::aptos_coin::AptosCoin": "APT",
  "0x000000000000000000000000000000000000000000000000000000000000000a": "APT",
  "0x000000000000000000000000000000000000000000000000000000000000000A": "APT",
  "0xa": "APT",
  "0xA": "APT",
};

/**
 * Verified tokens for Testnet
 */
export const testnetVerifiedTokens: Record<string, string> = {
  // Add testnet-specific verified tokens here
};

/**
 * Banned tokens for Testnet
 */
export const testnetBannedTokens: Record<string, string> = {
  // Testnet typically doesn't need banned tokens
};

/**
 * Banned addresses for Testnet
 */
export const testnetBannedAddresses: Record<string, string> = {};

/**
 * Banned token symbols for Testnet
 */
export const testnetBannedTokenSymbols: Record<string, string> = {};

/**
 * Banned collections for Testnet
 */
export const testnetBannedCollections: Record<string, string> = {};

/**
 * Supply limit overrides for Testnet
 */
export const testnetSupplyLimitOverrides: Record<string, bigint> = {};
