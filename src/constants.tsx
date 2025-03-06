import {CoinDescription} from "./api/hooks/useGetCoinList";

/**
 * Network
 */

const prefix = import.meta.env.REACT_APP_PREFIX || "";

export const mainnetUrl =
  import.meta.env.MAINNET_URL || `https://mainnet.movementnetwork.xyz/v1`;
export const devnetUrl =
  import.meta.env.DEVNET_URL ||
  `https://${prefix}aptos.devnet.suzuka.movementlabs.xyz/v1`;

export const bardockTestnetUrl =
  import.meta.env.MOVEMENT_TESTNET_URL ||
  `https://${prefix}testnet.bardock.movementnetwork.xyz/v1`;

export const mevmdevnetUrl =
  import.meta.env.IMOLA_URL ||
  `https://${prefix}aptos.devnet.imola.movementlabs.xyz/v1`;

  export const networks = {
    mainnet: mainnetUrl,
    testnet: "",
    "bardock testnet": bardockTestnetUrl,
    devnet: devnetUrl,
    local: "http://localhost:30731",
    mevmdevnet: "",
    custom: "",
  };

export type NetworkName = keyof typeof networks;

type ApiKeys = {
  [key in NetworkName]: string | undefined;
};

/**
 * Public Client IDs (API keys) from API Gateway. For mainnet, these come from the prod
 * API Gateway (developers.aptoslabs.com), for testnet and devnet these come from the
 * staging API Gateway (staging.developers.aptoslabs.com).
 *
 * These keys are all generated using the petra@aptoslabs.com account. Learn more:
 * https://www.notion.so/aptoslabs/API-Gateway-FAQ-for-product-owners-183b29ba6bed41f8922e6049d9d36486
 *
 * Some networks aren't configured to use API Gateway, e.g. randomnet. For that, set the
 * value to `undefined`.
 */
const apiKeys: ApiKeys = {
  mainnet: undefined,
  "bardock testnet": undefined,
  testnet: undefined,
  devnet: undefined,
  local: undefined,
  mevmdevnet: undefined,
  custom: undefined,
};

export function getApiKey(network_name: NetworkName): string | undefined {
  return apiKeys[network_name];
}

export function isValidNetworkName(value: string): value is NetworkName {
  return value in networks;
}

export enum Network {
  MAINNET = "mainnet",
  BARDOCK_TESTNET = "bardock-testnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
  LOCAL = "local",
  PREVIEWNET = "mevm-devnet",
  CUSTOM = "custom",
}

// Remove trailing slashes
for (const key of Object.keys(networks)) {
  const networkName = key as NetworkName;
  if (networks[networkName].endsWith("/")) {
    networks[networkName] = networks[networkName].slice(0, -1);
  }
}

export const defaultNetworkName: NetworkName = "mainnet" as const;

if (!(defaultNetworkName in networks)) {
  throw `defaultNetworkName '${defaultNetworkName}' not in Networks!`;
}

/**
 * Feature
 */
export const features = {
  prod: "Production Mode",
  dev: "Development Mode",
  earlydev: "Early Development Mode",
};

export type FeatureName = keyof typeof features;

export function isValidFeatureName(value: string): value is FeatureName {
  return value in features;
}

// Remove trailing slashes
for (const key of Object.keys(features)) {
  const featureName = key as FeatureName;
  if (features[featureName].endsWith("/")) {
    features[featureName] = features[featureName].slice(0, -1);
  }
}

export const defaultFeatureName: FeatureName = "prod" as const;

if (!(defaultFeatureName in features)) {
  throw `defaultFeatureName '${defaultFeatureName}' not in Features!`;
}

/**
 * Delegation Service
 */
export const OCTA = 100000000;

/**
 * Core Address
 */
export const objectCoreResource = "0x1::object::ObjectCore";
export const faMetadataResource = "0x1::fungible_asset::Metadata";
export const tokenV2Address = "0x4::token::Token";
export const collectionV2Address = "0x4::collection::Collection";

/**
 * Address overrides
 */
// This is an override of ANS names, in case we want to display a verified name for an address
// TODO: this probably belongs somewhere else... but, for now, it's here
// https://github.com/aptscan-ai/labels/blob/3187ad6b0710261e37324bbc336f74e9a07334a0/labels.json#L216
// https://github.com/apscan/explorer/blob/master/src/config/address-tags.ts
export const knownAddresses: Record<string, string> = {
  "0x0000000000000000000000000000000000000000000000000000000000000001":
    "Framework (0x1)",
  "0x0000000000000000000000000000000000000000000000000000000000000003":
    "Legacy Token (0x3)",
  "0x0000000000000000000000000000000000000000000000000000000000000004":
    "Digital Assets (0x4)",
  "0x000000000000000000000000000000000000000000000000000000000000000A":
    "MOVE Coin Fungible Asset",
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff":
    "Burn Address",
};

export const scamAddresses: Record<string, string> = {
  // Known Scammers
};

/**
 * Coin overrides
 */
// This provides a way to hardcode coins that are not in the token list, but still
// have functionality used elsewhere
export const HardCodedCoins: Record<string, CoinDescription> = {
  "0x1::aptos_coin::AptosCoin": {
    chainId: 1,
    tokenAddress: "0x1::aptos_coin::AptosCoin",
    faAddress: "0x1::aptos_coin::AptosCoin",
    name: "MOVE Coin",
    symbol: "MOVE",
    decimals: 8,
    panoraSymbol: "MOVE",
    bridge: null,
    logoUrl:
      "/logo.png",
    websiteUrl: "https://movementnetwork.xyz",
    category: "Native",
    isInPanoraTokenList: false,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
    isBanned: false,
    panoraOrderIndex: 1,
    panoraIndex: 1,
    coinGeckoId: "movement",
    coinMarketCapId: 32452,
    native: true,
  },
  "0x000000000000000000000000000000000000000000000000000000000000000a": {
    chainId: 1,
    tokenAddress: "0xa",
    faAddress: "0xa",
    name: "MOVE Coin",
    symbol: "MOVE",
    decimals: 8,
    panoraSymbol: "MOVE",
    bridge: null,
    logoUrl:
      "/logo.png",
    websiteUrl: "https://movementnetwork.xyz",
    category: "Native",
    isInPanoraTokenList: false,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
    isBanned: false,
    panoraOrderIndex: 1,
    panoraIndex: 1,
    coinGeckoId: "movement",
    coinMarketCapId: 32452,
    native: true,
  },
  "0x447721a30109c662dde9c73a0c2c9c9c459fb5e5a9c92f03c50fa69737f5d08d": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0x447721a30109c662dde9c73a0c2c9c9c459fb5e5a9c92f03c50fa69737f5d08d",
    name: "USDT.e",
    symbol: "USDT.e",
    decimals: 6,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://tether.to/images/logoCircle.svg",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 2,
    panoraIndex: 2,
    coinGeckoId: "tether",
    coinMarketCapId: 825,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0x83121c9f9b0527d1f056e21a950d6bf3b9e9e2e8353d0e95ccea726713cbea39": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0x83121c9f9b0527d1f056e21a950d6bf3b9e9e2e8353d0e95ccea726713cbea39",
    name: "USDC.e",
    symbol: "USDC.e",
    decimals: 6,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://circle.com/usdc-icon",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 3,
    panoraIndex: 3,
    coinGeckoId: "usd-coin",
    coinMarketCapId: 3408,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0x908828f4fb0213d4034c3ded1630bbd904e8a3a6bf3c63270887f0b06653a376": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0x908828f4fb0213d4034c3ded1630bbd904e8a3a6bf3c63270887f0b06653a376",
    name: "WETH.e",
    symbol: "WETH.e",
    decimals: 8,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://etherscan.io/token/images/weth_28.png",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 4,
    panoraIndex: 4,
    coinGeckoId: "weth",
    coinMarketCapId: 2396,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xb06f29f24dde9c6daeec1f930f14a441a8d6c0fbea590725e88b340af3e1939c": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xb06f29f24dde9c6daeec1f930f14a441a8d6c0fbea590725e88b340af3e1939c",
    name: "WBTC.e",
    symbol: "WBTC.e",
    decimals: 8,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1747036384",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
    coinGeckoId: "wrapped-bitcoin",
    coinMarketCapId: 3717,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
};

/**
 * Coin supply limit overrides
 *
 * These must be vetted to not have mint or burn capabilities
 */
export const supplyLimitOverrides: Record<string, bigint> = {
};

export const EMOJICOIN_REGISTRY_ADDRESS =
  "0x4b947ed016c64bde81972d69ea7d356de670d57fd2608b129f4d94ac0d0ee61";

export const nativeTokens: Record<string, string> = {
  "0x1::aptos_coin::AptosCoin": "MOVE",
  "0x000000000000000000000000000000000000000000000000000000000000000a": "MOVE",
  "0x000000000000000000000000000000000000000000000000000000000000000A": "MOVE",
  "0xa": "MOVE",
  "0xA": "MOVE",
};
export const manuallyVerifiedTokens: Record<string, string> = {
  "0x447721a30109c662dde9c73a0c2c9c9c459fb5e5a9c92f03c50fa69737f5d08d": "USDT.e",
  "0x83121c9f9b0527d1f056e21a950d6bf3b9e9e2e8353d0e95ccea726713cbea39": "USDC.e",
  "0x908828f4fb0213d4034c3ded1630bbd904e8a3a6bf3c63270887f0b06653a376": "WETH.e",
  "0xb06f29f24dde9c6daeec1f930f14a441a8d6c0fbea590725e88b340af3e1939c": "WBTC.e",
};
export const MARKED_AS_SCAM = "Marked as scam";
export const MARKED_AS_POSSIBLE_SCAM = "Marked as possible scam";
export const labsBannedTokens: Record<string, string> = {
};
export const labsBannedAddresses: Record<string, string> = {
};

export const labsBannedTokenSymbols: Record<string, string> = {
};
