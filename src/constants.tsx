import {CoinDescription} from "./api/hooks/useGetCoinList";
import projectConstants from "./project_constants.json";

/**
 * Network
 */
export const devnetUrl =
  import.meta.env.APTOS_DEVNET_URL ||
  "https://api.devnet.staging.aptoslabs.com/v1";

export const networks: Record<string, string> = {
  mainnet: "https://api.mainnet.aptoslabs.com/v1",
  testnet: "https://api.testnet.staging.aptoslabs.com/v1",
  devnet: devnetUrl,
  decibel: "https://api.netna.staging.aptoslabs.com/v1",
  local: "http://127.0.0.1:8080/v1",
};

export const hiddenNetworks = ["decibel"];

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
  mainnet: "AG-4SNLEBS1PFZ3PCMUCA3T3MW5WWF5JWLJX",
  testnet: "AG-6ZFXBNIVINVKOKLNAHNTFPDHY8WMBBD3X",
  devnet: "AG-GA6I9F6H8NM1ACW8ZVJGMPUTJUKZ5KN6A",
  decibel: undefined,
  local: undefined,
};

export function getApiKey(network_name: NetworkName): string | undefined {
  return apiKeys[network_name];
}

export function isValidNetworkName(value: string): value is NetworkName {
  return value in networks;
}

export enum Network {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
  DECIBEL = "decibel",
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
export const knownAddresses: Record<string, string> =
  projectConstants.knownAddresses;

export const scamAddresses: Record<string, string> =
  projectConstants.scamAddresses;

/**
 * Coin overrides
 */
// This provides a way to hardcode coins that are not in the token list, but still
// have functionality used elsewhere
export const HardCodedCoins: Record<string, CoinDescription> =
  projectConstants.hardCodedCoins as Record<string, CoinDescription>;

/**
 * Coin supply limit overrides
 *
 * These must be vetted to not have mint or burn capabilities
 */
export const supplyLimitOverrides: Record<string, bigint> = {
  // Note: All Uptos pump coins are 1 billion supply, and the mint / freeze / burn caps are destroyed at creation time
  "0x268d4a7a2ad93274edf6116f9f20ad8455223a7ab5fc73154f687e7dbc3e3ec6::LOON::LOON":
    1000000000000000n, // Caps burned at creation
  "0x967adbf2e05fe665ab86a3bf2c4acfa39fbf62097963474ef70a0786dae8cfa2::NRUH::NRUH":
    1000000000000000n, // Caps burned at creation
  "0x4fbed3f8a3fd8a11081c8b6392152a8b0cb14d70d0414586f0c9b858fcd2d6a7::UPTOS::UPTOS":
    8888888888800000000n, // Caps burned at https://explorer.aptoslabs.com/txn/0x4594e752ad872dd4d6fcdcdfe5a226de3556864dfa825bf77d90df810f25257e?network=mainnet no mints since
};

export const EMOJICOIN_REGISTRY_ADDRESS =
  "0x4b947ed016c64bde81972d69ea7d356de670d57fd2608b129f4d94ac0d0ee61";

export const nativeTokens: Record<string, string> = {
  "0x1::aptos_coin::AptosCoin": "APT",
  "0x000000000000000000000000000000000000000000000000000000000000000a": "APT",
  "0x000000000000000000000000000000000000000000000000000000000000000A": "APT",
  "0xa": "APT",
  "0xA": "APT",
};
export const manuallyVerifiedTokens: Record<string, string> =
  projectConstants.manuallyVerifiedTokens;
export const labsBannedTokens: Record<string, string> =
  projectConstants.labsBannedTokens;
export const labsBannedAddresses: Record<string, string> =
  projectConstants.labsBannedAddresses;

export const MARKED_AS_SCAM = "Marked as scam by Aptos Labs";

export const labsBannedTokenSymbols: Record<string, string> = {
  APT: MARKED_AS_SCAM,
};
