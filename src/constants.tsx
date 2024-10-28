/**
 * Network
 */

const prefix = import.meta.env.REACT_APP_PREFIX || "";

export const mainnetUrl =
  import.meta.env.MAINNET_URL || `https://${prefix}aptos.movementlabs.xyz/v1`;
export const devnetUrl =
  import.meta.env.DEVNET_URL ||
  `https://${prefix}aptos.devnet.suzuka.movementlabs.xyz/v1`;
export const testnetUrl =
  import.meta.env.TESTNET_URL ||
  `https://${prefix}aptos.testnet.suzuka.movementlabs.xyz/v1`;

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
  testnet: testnetUrl,
  "porto testnet": portoTestnetUrl,
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
  mainnet: "AG-4SNLEBS1PFZ3PCMUCA3T3MW5WWF5JWLJX",
  "porto testnet": "AG-6ZFXBNIVINVKOKLNAHNTFPDHY8WMBBD3X",
  "bardock testnet": "AG-6ZFXBNIVINVKOKLNAHNTFPDHY8WMBBD3X",
  testnet: "AG-6ZFXBNIVINVKOKLNAHNTFPDHY8WMBBD3X",
  devnet: "AG-GA6I9F6H8NM1ACW8ZVJGMPUTJUKZ5KN6A",
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
  PORTO_TESTNET = "porto-testnet",
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

export const defaultNetworkName: NetworkName = "porto testnet" as const;

if (!(defaultNetworkName in networks)) {
  throw `defaultNetworkName '${defaultNetworkName}' not in Networks!`;
}

export const defaultNetwork = networks[defaultNetworkName];

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

export const defaultFeature = features[defaultFeatureName];

/**
 * Delegation Service
 */
export const OCTA = 100000000;
export const WHILTELISTED_TESTNET_DELEGATION_NODES = import.meta.env
  .REACT_APP_WHILTELISTED_TESTNET_DELEGATION_NODES
  ? import.meta.env.REACT_APP_WHILTELISTED_TESTNET_DELEGATION_NODES.split(",")
  : null;

/**
 * Core Address
 */
export const objectCoreAddress = "0x1::object::ObjectCore";
export const tokenV2Address = "0x4::token::Token";
export const collectionV2Address = "0x4::collection::Collection";
