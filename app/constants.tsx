// Re-export all constants from lib/constants for backwards compatibility
export * from "./lib/constants";

// Additional exports from the original constants file
import {CoinDescription} from "./api/hooks/useGetCoinList";

/**
 * Address overrides
 */
export const knownAddresses: Record<string, string> = {
  "0x0000000000000000000000000000000000000000000000000000000000000001":
    "Framework (0x1)",
  "0x0000000000000000000000000000000000000000000000000000000000000003":
    "Legacy Token (0x3)",
  "0x0000000000000000000000000000000000000000000000000000000000000004":
    "Digital Assets (0x4)",
  "0x000000000000000000000000000000000000000000000000000000000000000A":
    "Aptos Coin Fungible Asset",
};

export const scamAddresses: Record<string, string> = {
  "0xde08428deaca3139a570fffb4553f1a2ad6e97f82b6cbdc1a5949b9b39c177e6":
    "Known Scam",
};

/**
 * Coin overrides
 */
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
    coinGeckoId: "aptos",
    coinMarketCapId: 21794,
    native: true,
  },
};

export const supplyLimitOverrides: Record<string, bigint> = {};

export const EMOJICOIN_REGISTRY_ADDRESS =
  "0x4b947ed016c64bde81972d69ea7d356de670d57fd2608b129f4d94ac0d0ee61";

export const nativeTokens: Record<string, string> = {
  "0x1::aptos_coin::AptosCoin": "APT",
  "0xa": "APT",
};

export const manuallyVerifiedTokens: Record<string, string> = {};
export const MARKED_AS_SCAM = "Marked as scam";
export const labsBannedTokens: Record<string, string> = {};
export const labsBannedAddresses: Record<string, string> = {};
export const labsBannedTokenSymbols: Record<string, string> = {
  APT: MARKED_AS_SCAM,
};
export const labsBannedCollections: Record<string, string> = {};
