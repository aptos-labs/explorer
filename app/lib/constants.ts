/**
 * Network Configuration
 */
export const devnetUrl =
  import.meta.env.APTOS_DEVNET_URL ||
  "https://api.devnet.staging.aptoslabs.com/v1";

export const networks: Record<string, string> = {
  mainnet: "https://api.mainnet.aptoslabs.com/v1",
  testnet: "https://api.testnet.staging.aptoslabs.com/v1",
  devnet: devnetUrl,
  decibel: "https://api.netna.aptoslabs.com/v1",
  shelbynet: "https://api.shelbynet.staging.shelby.xyz/v1",
  local: "http://127.0.0.1:8080/v1",
};

export const hiddenNetworks: readonly NetworkName[] = [
  "decibel",
  "shelbynet",
  "local",
] as const;

export type NetworkName = keyof typeof networks;

type ApiKeys = {
  [key in NetworkName]: string | undefined;
};

/**
 * Public Client IDs (API keys) from API Gateway
 */
const apiKeys: ApiKeys = {
  mainnet: "AG-4SNLEBS1PFZ3PCMUCA3T3MW5WWF5JWLJX",
  testnet: "AG-6ZFXBNIVINVKOKLNAHNTFPDHY8WMBBD3X",
  devnet: "AG-GA6I9F6H8NM1ACW8ZVJGMPUTJUKZ5KN6A",
  decibel: "AG-JAG5SGHTW6VICWAU1IAQ3ZTODVHBYDWGV",
  shelbynet: "AG-MGQQAXV57YJVDQANQPBQDFJVFMUY912EC",
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
  SHELBYNET = "shelbynet",
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
 * Feature Configuration
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

export const defaultFeatureName: FeatureName = "prod" as const;

/**
 * Core Constants
 */
export const OCTA = 100000000;

/**
 * Core Address Constants
 */
export const objectCoreResource = "0x1::object::ObjectCore";
export const faMetadataResource = "0x1::fungible_asset::Metadata";
export const tokenV2Address = "0x4::token::Token";
export const collectionV2Address = "0x4::collection::Collection";

/**
 * GraphQL Endpoints
 */
export function getGraphqlURI(networkName: NetworkName): string | undefined {
  switch (networkName) {
    case "mainnet":
      return "https://api.mainnet.aptoslabs.com/v1/graphql";
    case "testnet":
      return "https://api.testnet.staging.aptoslabs.com/v1/graphql";
    case "devnet":
      return "https://api.devnet.staging.aptoslabs.com/v1/graphql";
    case "decibel":
      return "https://api.netna.aptoslabs.com/v1/graphql";
    case "shelbynet":
      return "https://api.shelbynet.staging.shelby.xyz/v1/graphql";
    case "local":
      return "http://127.0.0.1:8090/v1/graphql";
    default:
      return undefined;
  }
}

/**
 * SEO Constants
 */
export const DEFAULT_DESCRIPTION =
  "Explore transactions, accounts, events, nodes, gas fees and other network activity within the Aptos Network.";
export const DEFAULT_OG_IMAGE = "https://explorer.aptoslabs.com/og-image.png";
export const BASE_URL = "https://explorer.aptoslabs.com";
