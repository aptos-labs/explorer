import {CoinDescription} from "./api/hooks/useGetCoinList";

/**
 * Network
 */

const prefix = import.meta.env.REACT_APP_PREFIX || "";

export const mainnetUrl =
  import.meta.env.MAINNET_URL || `https://mainnet.movementnetwork.xyz/v1`;

export const bardockTestnetUrl =
  import.meta.env.MOVEMENT_TESTNET_URL ||
  `https://${prefix}testnet.bardock.movementnetwork.xyz/v1`;

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
  "0x447721a30109c662dde9c73a0c2c9c9c459fb5e5a9c92f03c50fa69737f5d08d": {
    chainId: 126,
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
    chainId: 126,
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
    chainId: 126,
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
    chainId: 126,
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
  "0x527c43638a6c389a9ad702e7085f31c48223624d5102a5207dfab861f482c46d": {
    chainId: 126,
    tokenAddress: null,
    faAddress:
      "0x527c43638a6c389a9ad702e7085f31c48223624d5102a5207dfab861f482c46d",
    name: "solvBTC",
    symbol: "solvBTC",
    decimals: 8,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://assets.coingecko.com/coins/images/36800/standard/solvBTC.png?1719810684",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
    coinGeckoId: "solv-btc",
    coinMarketCapId: 33312,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0x0658f4ef6f76c8eeffdc06a30946f3f06723a7f9532e2413312b2a612183759c": {
    chainId: 126,
    tokenAddress: null,
    faAddress:
      "0x0658f4ef6f76c8eeffdc06a30946f3f06723a7f9532e2413312b2a612183759c",
    name: "LBTC",
    symbol: "LBTC",
    decimals: 8,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://assets.coingecko.com/coins/images/39969/standard/LBTC_Logo.png?1724959872",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
    coinGeckoId: "lombard-staked-btc",
    coinMarketCapId: 33652,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0x95c0fd13373299ada1b9f09ff62473ab8b3908e6a30011730210c141dffdc990": {
    chainId: 126,
    tokenAddress: null,
    faAddress:
      "0x95c0fd13373299ada1b9f09ff62473ab8b3908e6a30011730210c141dffdc990",
    name: "stBTC",
    symbol: "stBTC",
    decimals: 8,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://assets.coingecko.com/coins/images/50978/standard/a.jpg?1730208372",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
    coinGeckoId: "lorenzo-stbtc",
    coinMarketCapId: 0,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xff91f0df99b217436229b85ae900a2b67970eda92a88b06eb305949ec9828ed6": {
    chainId: 126,
    tokenAddress: null,
    faAddress:
      "0xff91f0df99b217436229b85ae900a2b67970eda92a88b06eb305949ec9828ed6",
    name: "enzoBTC",
    symbol: "enzoBTC",
    decimals: 8,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://assets.coingecko.com/coins/images/54447/standard/enzo_btc.png?1739773963",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
    coinGeckoId: "lorenzo-wrapped-bitcoin",
    coinMarketCapId: 0,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0x2f6af255328fe11b88d840d1e367e946ccd16bd7ebddd6ee7e2ef9f7ae0c53ef": {
    chainId: 126,
    tokenAddress: null,
    faAddress:
      "0x2f6af255328fe11b88d840d1e367e946ccd16bd7ebddd6ee7e2ef9f7ae0c53ef",
    name: "ezETH",
    symbol: "ezETH",
    decimals: 8,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://assets.coingecko.com/coins/images/34753/standard/Ezeth_logo_circle.png?1713496404",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
    coinGeckoId: "renzo-restaked-eth",
    coinMarketCapId: 29520,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0x51ffc9885233adf3dd411078cad57535ed1982013dc82d9d6c433a55f2e0035d": {
    chainId: 126,
    tokenAddress: null,
    faAddress:
      "0x51ffc9885233adf3dd411078cad57535ed1982013dc82d9d6c433a55f2e0035d",
    name: "rsETH",
    symbol: "rsETH",
    decimals: 8,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://assets.coingecko.com/coins/images/33800/standard/Icon___Dark.png?1702991855",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
    coinGeckoId: "kelp-dao-restaked-eth",
    coinMarketCapId: 29242,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xe956f5062c3b9cba00e82dc775d29acf739ffa1e612e619062423b58afdbf035": {
    chainId: 126,
    tokenAddress: null,
    faAddress:
      "0xe956f5062c3b9cba00e82dc775d29acf739ffa1e612e619062423b58afdbf035",
    name: "weETH",
    symbol: "weETH",
    decimals: 8,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://assets.coingecko.com/coins/images/33033/standard/weETH.png?1701438396",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
    coinGeckoId: "wrapped-eeth",
    coinMarketCapId: 28695,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xe4354602aa4311f36240dd57f3f3435ffccdbd0cd2963f1a69da39a2dbcd59b5": {
    chainId: 126,
    tokenAddress: null,
    faAddress:
      "0xe4354602aa4311f36240dd57f3f3435ffccdbd0cd2963f1a69da39a2dbcd59b5",
    name: "frxUSD",
    symbol: "frxUSD",
    decimals: 8,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://assets.coingecko.com/coins/images/53963/standard/frxUSD.png?1737792154",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
    coinGeckoId: "frax-usd",
    coinMarketCapId: 36039,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xbf2efbffbbd7083aaf006379d96b866b73bb4eb9684a7504c62feafe670962c2": {
    chainId: 126,
    tokenAddress: null,
    faAddress:
      "0xbf2efbffbbd7083aaf006379d96b866b73bb4eb9684a7504c62feafe670962c2",
    name: "sfrxUSD",
    symbol: "sfrxUSD",
    decimals: 8,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://assets.coingecko.com/coins/images/53964/standard/sfrxUSD.png?1737792232",
    websiteUrl: " ",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
    coinGeckoId: "staked-frax-usd",
    coinMarketCapId: 36038,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0x9d146a4c9472a7e7b0dbc72da0eafb02b54173a956ef22a9fba29756f8661c6c": {
    chainId: 126,
    tokenAddress: null,
    faAddress:
      "0x9d146a4c9472a7e7b0dbc72da0eafb02b54173a956ef22a9fba29756f8661c6c",
    name: "USDe",
    symbol: "USDe",
    decimals: 6,
    bridge: "LayerZero",
    logoUrl: "https://arweave.net/qeSnRm_FIyp_khPfmg8o1zQeGO4AczDaEKe8jEUOzL4",
    websiteUrl: "https://ethena.fi",
    coinGeckoId: "ethena-usde",
    coinMarketCapId: 29470,
    panoraSymbol: null,
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0x74f0c7504507f7357f8a218cc70ce3fc0f4b4e9eb8474e53ca778cb1e0c6dcc5": {
    chainId: 126,
    tokenAddress: null,
    faAddress:
      "0x74f0c7504507f7357f8a218cc70ce3fc0f4b4e9eb8474e53ca778cb1e0c6dcc5",
    name: "Staked USDe",
    symbol: "sUSDe",
    decimals: 6,
    bridge: "LayerZero",
    logoUrl: "https://arweave.net/iY7Aj5iwHKDIDL0m7QxeQN2URRrphWRpdKPJjE8fcaQ",
    websiteUrl: "https://ethena.fi",
    coinGeckoId: "ethena-staked-usde",
    coinMarketCapId: 29471,
    panoraSymbol: null,
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
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
  "0x527c43638a6c389a9ad702e7085f31c48223624d5102a5207dfab861f482c46d": "solvBTC",
  "0x0658f4ef6f76c8eeffdc06a30946f3f06723a7f9532e2413312b2a612183759c": "LBTC",
  "0x95c0fd13373299ada1b9f09ff62473ab8b3908e6a30011730210c141dffdc990": "stBTC",
  "0xff91f0df99b217436229b85ae900a2b67970eda92a88b06eb305949ec9828ed6": "enzoBTC",
  "0x2f6af255328fe11b88d840d1e367e946ccd16bd7ebddd6ee7e2ef9f7ae0c53ef": "ezETH",
  "0x51ffc9885233adf3dd411078cad57535ed1982013dc82d9d6c433a55f2e0035d": "rsETH",
  "0xe956f5062c3b9cba00e82dc775d29acf739ffa1e612e619062423b58afdbf035": "weETH",
  "0xe4354602aa4311f36240dd57f3f3435ffccdbd0cd2963f1a69da39a2dbcd59b5": "frxUSD",
  "0xbf2efbffbbd7083aaf006379d96b866b73bb4eb9684a7504c62feafe670962c2": "sfrxUSD",
  "0x9d146a4c9472a7e7b0dbc72da0eafb02b54173a956ef22a9fba29756f8661c6c": "USDe",
  "0x74f0c7504507f7357f8a218cc70ce3fc0f4b4e9eb8474e53ca778cb1e0c6dcc5": "sUSDe"
};
export const MARKED_AS_SCAM = "Marked as scam";
export const MARKED_AS_POSSIBLE_SCAM = "Marked as possible scam";
export const labsBannedTokens: Record<string, string> = {
};
export const labsBannedAddresses: Record<string, string> = {
};

export const labsBannedTokenSymbols: Record<string, string> = {
};
