/**
 * Network
 */
export const devnetUrl =
  import.meta.env.APTOS_DEVNET_URL ||
  "https://aptos.devnet.suzuka.movementlabs.xyz/v1";
export const testnetUrl =
  import.meta.env.TESTNET_URL ||
  "https://aptos.testnet.suzka.movementlabs.xyz/v1";
export const previewnetUrl =
  import.meta.env.INOLA_URL || "https://aptos.devnet.imola.movementlabs.xyz/v1";

export const networks = {
  mainnet: testnetUrl,
  testnet: testnetUrl,
  devnet: devnetUrl,
  local: "http://localhost:30731",
  previewnet: previewnetUrl,
};

export type NetworkName = keyof typeof networks;

export function isValidNetworkName(value: string): value is NetworkName {
  return value in networks;
}

export enum Network {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
  LOCAL = "local",
  PREVIEWNET = "mevm-devnet",
}

// Remove trailing slashes
for (const key of Object.keys(networks)) {
  const networkName = key as NetworkName;
  if (networks[networkName].endsWith("/")) {
    networks[networkName] = networks[networkName].slice(0, -1);
  }
}

export const defaultNetworkName: NetworkName = "testnet" as const;

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
