import {CoinDescription} from "./api/hooks/useGetCoinList";

/**
 * Network
 */

const prefix = import.meta.env.REACT_APP_PREFIX || "";

export const mainnetUrl =
  import.meta.env.MAINNET_URL || `https://mainnet.movementnetwork.xyz/v1`;

export const bardockTestnetUrl =
  import.meta.env.MOVEMENT_TESTNET_URL ||
  `https://testnet.movementnetwork.xyz/v1`;

  export const networks = {
    mainnet: mainnetUrl,
    testnet: "",
    "bardock testnet": bardockTestnetUrl,
  devnet: "",
    local: "http://localhost:30731",
    mevmdevnet: "",
    custom: "",
  };

export const availableNetworks = ["mainnet", "bardock testnet"];

export type NetworkName = keyof typeof networks;

type ApiKeys = {
  [key in NetworkName]: string | undefined;
};

/**
 * Public Client IDs (API keys) from API Gateway.
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
  "0x84b1675891d370d5de8f169031f9c3116d7add256ecf50a4bc71e3135ddba6e0":
    "Bybit 1",
  "0xbeda85a0a4e68adb980382a7182019a7b9a2ad4bba36f41024338dea5ff1eaac":
    "Kucoin 1",
  "0x0cf869189c785beaaad2f5c636ced4805aeae9cbf49070dc93aed2f16b99012a":
    "Gate 1",
  "0x31d0a30ae53e2ae852fcbdd1fce75a4ea6ad81417739ef96883eba9574ffe31e":
    "MovePosition Vault 1",
  "0x58739edcac2f86e62342466f20809b268430aedf32937eba32eaac7e0bbf5233":
    "Echelon Vault 1",
  "0x574ecf25ca263b4d9cbd43ded90bba6a52309e0cba2213f9606e4b4a3a20ffae":
    "Layerbank Vault 1",
  "0x79eb0f69a65a088d40776e1789bbc36f247bc5ec0eb2fa5fdbeaa1b1bb3a965a":
    "MEXC 1",
  "0x03f7399a0d3d646ce94ee0badf16c4c3f3c656fe3a5e142e83b5ebc011aa8b3d":
    "Mosaic",
  "0x26a95d4bd7d7fc3debf6469ff94837e03e887088bef3a3f2d08d1131141830d3":
    "Mosaic AMM",
  "0x373aab3f20ef3c31fc4caa287b0f18170f4a0b4a28c80f7ee79434458f70f241": 
    "Interest DEX",
  "0x46566b4a16a1261ab400ab5b9067de84ba152b5eb4016b217187f2a2ca980c5a":
    "YUZU",
  "0x4c5058bc4cd77fe207b8b9990e8af91e1055b814073f0596068e3b95a7ccd31a":
    "Move.Fun",
  "0x4877ee1d4970d17283fb9477094fd9b203e2c93ec6d6886e5d831c0b84c2ecf7":
    "Binance"
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
    chainId: 126,
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
    chainId: 126,
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
    panoraTags: ["InternalFA"],
    isBanned: false,
    panoraOrderIndex: 1,
    panoraIndex: 1,
    coinGeckoId: "movement",
    coinMarketCapId: 32452,
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

export const MARKED_AS_SCAM = "Marked as scam";
export const MARKED_AS_POSSIBLE_SCAM = "Marked as possible scam";
export const labsBannedTokens: Record<string, string> = {
};
export const labsBannedAddresses: Record<string, string> = {
};

export const labsBannedTokenSymbols: Record<string, string> = {
};
