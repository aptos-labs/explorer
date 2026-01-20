import {CoinDescription} from "../../api/hooks/useGetCoinList";

/**
 * Hardcoded coin/asset metadata for Mainnet
 * These override or supplement data from external APIs like Panora
 */
export const mainnetHardCodedCoins: Record<string, CoinDescription> = {
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
  "0xd39fcd33aedfd436a1bbb576a48d5c7c0ac317c9a9bb7d53ae9ffb41e8cb9fd9": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xd39fcd33aedfd436a1bbb576a48d5c7c0ac317c9a9bb7d53ae9ffb41e8cb9fd9",
    name: "Find Out Points",
    symbol: "FFO",
    decimals: 8,
    panoraSymbol: null,
    bridge: null,
    logoUrl: "",
    websiteUrl: "https://www.letsfindout.ai/",
    category: "Native",
    isInPanoraTokenList: false,
    isBanned: false,
    panoraOrderIndex: 999999999,
    panoraIndex: 999999999,
    coinGeckoId: null,
    coinMarketCapId: null,
    panoraUI: false,
    usdPrice: null,
    panoraTags: [],
  },
  "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
    name: "Tether USD",
    symbol: "USDt",
    decimals: 6,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://tether.to/images/logoCircle.svg",
    websiteUrl: "https://tether.to",
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
  "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://circle.com/usdc-icon",
    websiteUrl: "https://circle.com/usdc",
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
  "0xf37a8864fe737eb8ec2c2931047047cbaed1beed3fb0e5b7c5526dafd3b9c2e9": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xf37a8864fe737eb8ec2c2931047047cbaed1beed3fb0e5b7c5526dafd3b9c2e9",
    name: "USDe",
    symbol: "USDe",
    decimals: 6,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://arweave.net/qeSnRm_FIyp_khPfmg8o1zQeGO4AczDaEKe8jEUOzL4",
    websiteUrl: "https://ethena.fi",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 4,
    panoraIndex: 4,
    coinGeckoId: "ethena-usde",
    coinMarketCapId: 29470,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xb30a694a344edee467d9f82330bbe7c3b89f440a1ecd2da1f3bca266560fce69": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xb30a694a344edee467d9f82330bbe7c3b89f440a1ecd2da1f3bca266560fce69",
    name: "sUSDe",
    symbol: "sUSDe",
    decimals: 6,
    bridge: null,
    panoraSymbol: null,
    logoUrl: "https://arweave.net/iY7Aj5iwHKDIDL0m7QxeQN2URRrphWRpdKPJjE8fcaQ",
    websiteUrl: "https://ethena.fi",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 4,
    panoraIndex: 4,
    coinGeckoId: "ethena-staked-usde",
    coinMarketCapId: 29471,
    native: true,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89",
    name: "BlackRock BUIDL",
    symbol: "BUIDL",
    decimals: 6,
    panoraSymbol: null,
    bridge: null,
    logoUrl:
      "https://securitize-public-files.s3.us-east-2.amazonaws.com/ClientDocuments/buidl/token-logo-256.png",
    websiteUrl: "https://securitize.io/blackrock/BUIDL",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 4,
    panoraIndex: 4,
    coinGeckoId: "blackrock-usd-institutional-digital-liquidity-fund",
    coinMarketCapId: null,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xe528f4df568eb9fff6398adc514bc9585fab397f478972bcbebf1e75dee40a88": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xe528f4df568eb9fff6398adc514bc9585fab397f478972bcbebf1e75dee40a88",
    name: "Apollo Diversified Credit Fund",
    symbol: "ACRED",
    decimals: 6,
    panoraSymbol: null,
    bridge: null,
    logoUrl:
      "https://securitize-public-files.s3.us-east-2.amazonaws.com/ClientDocuments/apollo/apollo-token-logo-32x32.png",
    websiteUrl:
      "https://securitize.io/primary-market/apollo-diversified-credit-securitize-fund",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 4,
    panoraIndex: 4,
    coinGeckoId: "apollo-diversified-credit-securitize-fund",
    coinMarketCapId: null,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0x98e39700e0bc5420d0a5c461a5420f1a17358041761f64147b173dfb9e21052d": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0x98e39700e0bc5420d0a5c461a5420f1a17358041761f64147b173dfb9e21052d",
    name: "Myco",
    symbol: "MYCO",
    decimals: 8,
    panoraSymbol: null,
    bridge: null,
    logoUrl:
      "https://ipfs.io/ipfs/QmZsy7rtbj2vGMxDjCmTdeoa4mFwuxwiTpKkgkx65G93sc?filename=myco%20white%20%26%20green.png",
    websiteUrl: "https://www.myco.io",
    category: "Native",
    isInPanoraTokenList: false,
    isBanned: false,
    panoraOrderIndex: 5,
    panoraIndex: 5,
    coinGeckoId: null,
    coinMarketCapId: null,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xef0d49f03e48dbd055c3a369f74a304c366bda148005ddf6bb881ced79da0b09": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xef0d49f03e48dbd055c3a369f74a304c366bda148005ddf6bb881ced79da0b09",
    name: "Night Coin",
    symbol: "NIGHT",
    decimals: 8,
    panoraSymbol: null,
    bridge: null,
    logoUrl:
      "https://cdn.prod.website-files.com/640388e49053dc6d762dd327/673b864874a63fe32ddaa0f8_android-chrome-512x512.png",
    websiteUrl: "https://www.midnight.io",
    category: "Native",
    isInPanoraTokenList: false,
    isBanned: false,
    panoraOrderIndex: 6,
    panoraIndex: 6,
    coinGeckoId: "midnight-2",
    coinMarketCapId: 1011745,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xd0ab8c2f76cd640455db56ca758a9766a966c88f77920347aac1719edab1df5e": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xd0ab8c2f76cd640455db56ca758a9766a966c88f77920347aac1719edab1df5e",
    name: "Amaterasu",
    symbol: "AMA",
    decimals: 8,
    panoraSymbol: "AMA",
    bridge: null,
    logoUrl: "https://assets.amaterasu.gg/hybrid/icon.svg",
    websiteUrl: "https://www.amaterasu.gg",
    category: "Native",
    isInPanoraTokenList: false,
    isBanned: false,
    panoraOrderIndex: 7,
    panoraIndex: 7,
    coinGeckoId: null,
    coinMarketCapId: null,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xe9c2f12eba13a46b27f42b4028bed6f702e7e12271dbebd08f310df52d064e81": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xe9c2f12eba13a46b27f42b4028bed6f702e7e12271dbebd08f310df52d064e81",
    name: "WyndhamGarden1708",
    symbol: "WG1708",
    decimals: 8,
    panoraSymbol: "WG1708",
    bridge: null,
    logoUrl:
      "https://ipfs.propbase.app/ipfs/QmYMqu6frfwYBo7Z2cFpyE5UfZWyKkHn6zMrVhCBW2iuQm",
    websiteUrl:
      "https://ipfs.propbase.app/ipfs/QmcKjYgDpZyTjknRz5AhAa6JPoid4mb9Pjoznvgz3VT29v",
    category: "Native",
    isInPanoraTokenList: false,
    isBanned: false,
    panoraOrderIndex: 8,
    panoraIndex: 8,
    coinGeckoId: null,
    coinMarketCapId: null,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0x2597fe74a0dba786453d550fb348801183b69e734cdbd15f9c5537b566483cb7": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0x2597fe74a0dba786453d550fb348801183b69e734cdbd15f9c5537b566483cb7",
    name: "CassiaBanyanTreeB1045",
    symbol: "CAS1045",
    decimals: 8,
    panoraSymbol: "CAS1045",
    bridge: null,
    logoUrl:
      "https://ipfs.propbase.app/ipfs/bafkreifkynuzcjtrj34od4ja26alnkk3lb3rqgbrqpnqho4fmkeezejczu",
    websiteUrl:
      "https://ipfs.propbase.app/ipfs/bafkreidrdh4kp4yzvkwuygbniyu3bktmclxduikqqxzgeu2kuc245j3kiy",
    category: "Native",
    isInPanoraTokenList: false,
    isBanned: false,
    panoraOrderIndex: 8,
    panoraIndex: 8,
    coinGeckoId: null,
    coinMarketCapId: null,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xc546cc2dd26d9e9a4516b4514288bedf1085259fcb106b84b6469337f527fb92": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xc546cc2dd26d9e9a4516b4514288bedf1085259fcb106b84b6469337f527fb92",
    name: "PACT",
    symbol: "PACT",
    decimals: 8,
    panoraSymbol: "PACT",
    bridge: null,
    logoUrl:
      "https://files.pactlabs.xyz/aptos/fa/0xc546cc2dd26d9e9a4516b4514288bedf1085259fcb106b84b6469337f527fb92.png",
    websiteUrl: "https://pact.foundation",
    category: "Native",
    isInPanoraTokenList: false,
    isBanned: false,
    panoraOrderIndex: 8,
    panoraIndex: 8,
    coinGeckoId: null,
    coinMarketCapId: null,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xed18be0ea061c29dbbd2d22e9eb6bc61fde0babd1579c169bdd1d4f74730c419": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xed18be0ea061c29dbbd2d22e9eb6bc61fde0babd1579c169bdd1d4f74730c419",
    name: "EXPO Token",
    symbol: "EXPO",
    decimals: 8,
    panoraSymbol: "EXPO",
    bridge: null,
    logoUrl: "https://app-resources.expo2025-wallet.com/expo_token/icon.png",
    websiteUrl: "https://expo2025-wallet.com/",
    category: "Native",
    isInPanoraTokenList: false,
    isBanned: false,
    panoraOrderIndex: 8,
    panoraIndex: 8,
    coinGeckoId: null,
    coinMarketCapId: null,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xc9a5d270bb8bb47e7bb34377ceb529db2878e4a7b521b5b8a984b35f8feaa8e2": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xc9a5d270bb8bb47e7bb34377ceb529db2878e4a7b521b5b8a984b35f8feaa8e2",
    name: "Rewardy",
    symbol: "RWD",
    decimals: 8,
    panoraSymbol: "RWD",
    bridge: null,
    logoUrl:
      "https://rewardy.s3.ap-northeast-2.amazonaws.com/Rewardy+Coin/front_rwd.png",
    websiteUrl: "https://www.rewardywallet.com/",
    category: "Native",
    isInPanoraTokenList: false,
    isBanned: false,
    panoraOrderIndex: 9,
    panoraIndex: 9,
    coinGeckoId: null,
    coinMarketCapId: null,
    panoraUI: false,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0xb2c7780f0a255a6137e5b39733f5a4c85fe093c549de5c359c1232deef57d1b7": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0xb2c7780f0a255a6137e5b39733f5a4c85fe093c549de5c359c1232deef57d1b7",
    name: "Echo",
    symbol: "ECHO",
    decimals: 8,
    panoraSymbol: "ECHO",
    bridge: null,
    logoUrl: "https://assets.echo-protocol.xyz/images/echo.svg",
    websiteUrl: "https://www.echo-protocol.xyz/",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 9,
    panoraIndex: 9,
    coinGeckoId: "echo-protocol",
    coinMarketCapId: 36978,
    panoraUI: true,
    usdPrice: null,
    panoraTags: ["Native"],
  },
  "0x435ad41e7b383cef98899c4e5a22c8dc88ab67b22f95e5663d6c6649298c3a9d": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0x435ad41e7b383cef98899c4e5a22c8dc88ab67b22f95e5663d6c6649298c3a9d",
    name: "Hyperion",
    symbol: "RION",
    decimals: 6,
    panoraSymbol: "RION",
    bridge: null,
    logoUrl:
      "https://khnk24lv2ydj52ib5vomdmtlxhxxmvvyztzaa2jnrsgzk4ff4yfq.arweave.net/UdqtcXXWBp7pAe1cwbJrue92VrjM8gBpLYyNlXCl5gs",
    websiteUrl: "https://hyperion.xyz/",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 9,
    panoraIndex: 9,
    coinGeckoId: "hyperion",
    coinMarketCapId: 37344,
    panoraUI: true,
    usdPrice: null,
    panoraTags: ["Native", "Verified"],
  },
  "0x2a8227993a4e38537a57caefe5e7e9a51327bf6cd732c1f56648f26f68304ebc": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0x2a8227993a4e38537a57caefe5e7e9a51327bf6cd732c1f56648f26f68304ebc",
    name: "KGeN",
    symbol: "KGEN",
    decimals: 8,
    panoraSymbol: "KGEN",
    bridge: null,
    logoUrl: "https://prod-image-bucket.kgen.io/assets/kgen_token_logo.png",
    websiteUrl: "https://kgen.io/",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 9,
    panoraIndex: 9,
    coinGeckoId: "kgen",
    coinMarketCapId: 37344,
    panoraUI: true,
    usdPrice: null,
    panoraTags: ["Native", "Verified"],
  },
  "0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2": {
    chainId: 1,
    tokenAddress: null,
    faAddress:
      "0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2",
    name: "World Liberty Financial USD",
    symbol: "USD1",
    decimals: 6,
    panoraSymbol: "USD1",
    bridge: null,
    logoUrl:
      "https://raw.githubusercontent.com/worldliberty/usd1-metadata/refs/heads/main/logo.png",
    websiteUrl: "https://worldlibertyfinancial.com/",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 9,
    panoraIndex: 9,
    coinGeckoId: "usd1-wlfi",
    coinMarketCapId: 36148,
    panoraUI: true,
    usdPrice: null,
    panoraTags: ["Native", "Verified"],
  },
  "0x878370592f9129e14b76558689a4b570ad22678111df775befbfcbc9fb3d90ab": {
    chainId: 1,
    tokenAddress:
      "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06::mkl_token::MKL",
    faAddress:
      "0x878370592f9129e14b76558689a4b570ad22678111df775befbfcbc9fb3d90ab",
    name: "MKL",
    symbol: "MKL",
    decimals: 6,
    panoraSymbol: "MKL",
    bridge: null,
    logoUrl: "https://assets.panora.exchange/tokens/aptos/MKL.png",
    websiteUrl: "https://merkle.trade",
    category: "Native",
    isInPanoraTokenList: true,
    isBanned: false,
    panoraOrderIndex: 9,
    panoraIndex: 9,
    coinGeckoId: "merkle-trade",
    coinMarketCapId: 32997,
    panoraUI: true,
    usdPrice: null,
    panoraTags: ["Native", "Verified"],
  },
};

/**
 * Native token addresses for Mainnet
 */
export const mainnetNativeTokens: Record<string, string> = {
  "0x1::aptos_coin::AptosCoin": "APT",
  "0x000000000000000000000000000000000000000000000000000000000000000a": "APT",
  "0x000000000000000000000000000000000000000000000000000000000000000A": "APT",
  "0xa": "APT",
  "0xA": "APT",
};

/**
 * Manually verified tokens for Mainnet
 */
export const mainnetVerifiedTokens: Record<string, string> = {
  "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b": "USDt",
  "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b": "USDC",
  "0xf37a8864fe737eb8ec2c2931047047cbaed1beed3fb0e5b7c5526dafd3b9c2e9": "USDe",
  "0xb30a694a344edee467d9f82330bbe7c3b89f440a1ecd2da1f3bca266560fce69": "sUSDe",
  "0xd39fcd33aedfd436a1bbb576a48d5c7c0ac317c9a9bb7d53ae9ffb41e8cb9fd9":
    "Find Out Points",
  "0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89": "BUIDL",
  "0xe528f4df568eb9fff6398adc514bc9585fab397f478972bcbebf1e75dee40a88": "ACRED",
  "0x98e39700e0bc5420d0a5c461a5420f1a17358041761f64147b173dfb9e21052d": "MYCO",
  "0xef0d49f03e48dbd055c3a369f74a304c366bda148005ddf6bb881ced79da0b09": "NIGHT",
  "0xd0ab8c2f76cd640455db56ca758a9766a966c88f77920347aac1719edab1df5e": "AMA",
  "0xe9c2f12eba13a46b27f42b4028bed6f702e7e12271dbebd08f310df52d064e81":
    "Propbase WG1708",
  "0xc546cc2dd26d9e9a4516b4514288bedf1085259fcb106b84b6469337f527fb92": "PACT",
  "0xed18be0ea061c29dbbd2d22e9eb6bc61fde0babd1579c169bdd1d4f74730c419": "EXPO",
  "0xc9a5d270bb8bb47e7bb34377ceb529db2878e4a7b521b5b8a984b35f8feaa8e2": "RWD",
  "0x726ccb3c1ac023b3b24f9f2fc4c07b16f6e26f21b978651fde271767e0b641c4": "rKGEN",
  "0xb36527754eb54d7ff55daf13bcb54b42b88ec484bd6f0e3b2e0d1db169de6451": "AMI",
  "0x2ebb2ccac5e027a87fa0e2e5f656a3a4238d6a48d93ec9b610d570fc0aa0df12": "CELL",
  "0xeedba439a4ab8987a995cf5cfefebd713000b3365718a29dfbc36bc214445fb8": "VIBE",
  "0x2597fe74a0dba786453d550fb348801183b69e734cdbd15f9c5537b566483cb7":
    "CAS1045",
  "0xb2c7780f0a255a6137e5b39733f5a4c85fe093c549de5c359c1232deef57d1b7": "ECHO",
  "0x435ad41e7b383cef98899c4e5a22c8dc88ab67b22f95e5663d6c6649298c3a9d": "RION",
  "0x2a8227993a4e38537a57caefe5e7e9a51327bf6cd732c1f56648f26f68304ebc": "KGeN",
  "0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2": "USD1",
  "0x878370592f9129e14b76558689a4b570ad22678111df775befbfcbc9fb3d90ab": "MKL",
  "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06::mkl_token::MKL":
    "MKL",
};

/**
 * Banned tokens for Mainnet (scams/spam)
 */
export const mainnetBannedTokens: Record<string, string> = {
  "0x397071c01929cc6672a17f130bd62b1bce224309029837ce4f18214cc83ce2a7::USDC::USDC":
    "Marked as scam",
  "0x50788befc1107c0cc4473848a92e5c783c635866ce3c98de71d2eeb7d2a34f85::apt_rewards::APTRewards":
    "Marked as scam",
  "0xbbc4a9af0e7fa8885bda5db08028e7b882f2c2bba1e0fedbad1d8316f73f8b2f::ograffio::Ograffio":
    "Marked as scam",
  "0xf658475dc67a4d48295dbcea6de1dc3c9af64c1c80d4161284df369be941dafb::moon_coin::MoonCoin":
    "Marked as scam",
  "0x48327a479bf5c5d2e36d5e9846362cff2d99e0e27ff92859fc247893fded3fbd::APTOS::APTOS":
    "Marked as scam",
  "0xbc106d0fef7e5ce159423a1a9312e011bca7fb57f961146a2f88003a779b25c2::QUEST::QUEST":
    "Marked as scam",
  "0xbe5e8fa9dd45e010cadba1992409a0fc488ca81f386d636ba38d12641ef91136::maincoin::Aptmeme":
    "Marked as scam",
};

/**
 * Banned addresses for Mainnet
 */
export const mainnetBannedAddresses: Record<string, string> = {
  "0x50788befc1107c0cc4473848a92e5c783c635866ce3c98de71d2eeb7d2a34f85":
    "Marked as scam",
  "0xbbc4a9af0e7fa8885bda5db08028e7b882f2c2bba1e0fedbad1d8316f73f8b2f":
    "Marked as scam",
};

/**
 * Banned token symbols for Mainnet
 */
export const mainnetBannedTokenSymbols: Record<string, string> = {
  APT: "Marked as scam",
};

/**
 * Banned collections for Mainnet
 */
export const mainnetBannedCollections: Record<string, string> = {
  "0x4a1700de36e2f697b56b4d29ed9b59cbd26bccc6fe6d5cbafa382f34a7fe04af":
    "Marked as scam",
};

/**
 * Supply limit overrides for Mainnet
 * These must be vetted to not have mint or burn capabilities
 */
export const mainnetSupplyLimitOverrides: Record<string, bigint> = {
  // Note: All Uptos pump coins are 1 billion supply, and the mint / freeze / burn caps are destroyed at creation time
  "0x268d4a7a2ad93274edf6116f9f20ad8455223a7ab5fc73154f687e7dbc3e3ec6::LOON::LOON":
    1000000000000000n,
  "0x967adbf2e05fe665ab86a3bf2c4acfa39fbf62097963474ef70a0786dae8cfa2::NRUH::NRUH":
    1000000000000000n,
  "0x4fbed3f8a3fd8a11081c8b6392152a8b0cb14d70d0414586f0c9b858fcd2d6a7::UPTOS::UPTOS":
    8888888888800000000n,
};
