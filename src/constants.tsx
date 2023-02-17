/**
 * Network
 */
export const devnetUrl =
  process.env.APTOS_DEVNET_URL || "https://fullnode.devnet.aptoslabs.com/";

export const networks = {
  mainnet: "https://fullnode.mainnet.aptoslabs.com/",
  testnet: "https://fullnode.testnet.aptoslabs.com",
  devnet: devnetUrl,
  local: "http://localhost:8080",
};

export type NetworkName = keyof typeof networks;

export enum Network {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  DEVNET = "devnet",
  LOCAL = "local",
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

export const defaultNetwork = networks[defaultNetworkName];

/**
 * Feature
 */
export const features = {
  prod: "Production Mode",
  dev: "Development Mode",
};

export type FeatureName = keyof typeof features;

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

// TODO(jill): update this function name once in mainnet
export const DELEGATION_POOL_ADDRESS =
  "0x1310dc820487f24755e6e06747f6582118597a48868e2a98260fa8c3ee945cbd";
export const OCTA = 100000000;
export const MIN_ADD_STAKE_AMOUNT = 1; // min stake amount is 1 APT
export const WHILTELISTED_TESTNET_DELEGATION_NODES = [
  "0x5df905f817adf39293c596e83512ab8a9dc5a19980e11bd4ce44b6e749d33a0d",
  "0xa396d898018d6892b148789ed8a95e0bd6af05e0974cef3d5a1197ee2fa4519e",
];
