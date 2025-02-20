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

export const portoTestnetUrl =
  import.meta.env.MOVEMENT_TESTNET_URL ||
  `https://${prefix}testnet.porto.movementnetwork.xyz/v1`;

export const bardockTestnetUrl =
  import.meta.env.MOVEMENT_TESTNET_URL ||
  `https://${prefix}testnet.bardock.movementnetwork.xyz/v1`;

export const mevmdevnetUrl =
  import.meta.env.IMOLA_URL ||
  `https://${prefix}aptos.devnet.imola.movementlabs.xyz/v1`;

// This is the constant mapped in the NetworkSelect.tsx file
export const networks = {
  mainnet: mainnetUrl,
  testnet: portoTestnetUrl,
  "bardock testnet": bardockTestnetUrl,
  devnet: devnetUrl,
  local: "http://localhost:30731",
  mevmdevnet: mevmdevnetUrl,
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
    isInPanoraTokenList: true,
    panoraUI: true,
    usdPrice: null,
    panoraTags: ["Native"],
    isBanned: false,
    panoraOrderIndex: 1,
    panoraIndex: 1,
    coinGeckoId: "move",
    coinMarketCapId: 21794,
    native: true,
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
};
export const MARKED_AS_SCAM = "Marked as scam";
export const MARKED_AS_POSSIBLE_SCAM = "Marked as possible scam";
export const labsBannedTokens: Record<string, string> = {
};
export const labsBannedAddresses: Record<string, string> = {
};

export const labsBannedTokenSymbols: Record<string, string> = {
};
