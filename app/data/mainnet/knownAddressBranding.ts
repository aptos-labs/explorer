import type {KnownAddressBranding} from "../knownAddressBranding";
import {aptosFrameworkAddressBranding} from "../aptosFrameworkAddressBranding";

/**
 * Branding for well-known mainnet accounts (bridges, DEX deployers, CEX hot wallets, etc.).
 * Keys are standardized addresses (0x + 64 lowercase hex).
 */
const mainnetLabeledBranding: Record<string, KnownAddressBranding> = {
  // Bridges
  "0x5bc11445584a763c1fa7ed39081f1b920954da14e04b32440cba863d03e19625": {
    icon: "/address-icons/bridge-wormhole.png",
    description:
      "Wormhole bridge contracts on Aptos: cross-chain messaging and the portal used to move assets across networks.",
  },
  "0x576410486a2da45eee6c949c995670112ddf2fbeedab20350d506328eefc9d4f": {
    icon: "/address-icons/bridge-wormhole.png",
    description:
      "Wormhole-related token / wrapped asset factory and portal logic on Aptos.",
  },
  "0x54ad3d30af77b60d939ae356e6606de9a4da67583f02b962d2d3f2e481484e90": {
    icon: "/address-icons/bridge-layerzero.png",
    description:
      "LayerZero endpoint and bridge infrastructure on Aptos for omnichain messaging.",
  },
  "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa": {
    icon: "/address-icons/bridge-layerzero.png",
    description:
      "LayerZero token / OFT-style bridging contracts deployed on Aptos.",
  },
  "0x8d87a65ba30e09357fa2edea2c80dbac296e5dec2b18287113500b902942929d": {
    icon: "/address-icons/bridge-celer.png",
    description: "Celer cBridge and inter-chain liquidity contracts on Aptos.",
  },

  // DEX & AMM deployers
  "0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa": {
    icon: "/address-icons/dex-pancakeswap.png",
    description:
      "PancakeSwap deployment and pool logic on Aptos (AMM and related modules).",
  },
  "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af": {
    icon: "/address-icons/dex-thala.png",
    description: "ThalaSwap v1 protocol contracts on Aptos.",
  },
  "0x007730cd28ee1cdc9e999336cbc430f99e7c44397c0aa77516f6f23a78559bb5": {
    icon: "/address-icons/dex-thala.png",
    description: "ThalaSwap v2 AMM deployment on Aptos.",
  },
  "0x075b4890de3e312d9425408c43d9a9752b64ab3562a30e89a55bdc568c645920": {
    icon: "/address-icons/dex-thala.png",
    description:
      "ThalaSwap concentrated-liquidity (CL) pools and routing on Aptos.",
  },
  "0x6b3720cd988adeaf721ed9d4730da4324d52364871a68eac62b46d21e4d2fa99": {
    icon: "/address-icons/dex-thala.png",
    description: "Thala liquidity mining / farm contracts on Aptos.",
  },
  "0xcb8365dc9f7ac6283169598aaad7db9c7b12f52da127007f37fa4565170ff59c": {
    icon: "/address-icons/dex-thala.png",
    description: "ThalaSwap CL farm and reward distribution on Aptos.",
  },
  "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12": {
    icon: "/address-icons/dex-liquidswap.png",
    description:
      "LiquidSwap v0 (Pontem) AMM deployment — historical early Aptos DEX version.",
  },
  "0x0163df34fccbf003ce219d3f1d9e70d140b60622cb9dd47599c25fb2f797ba6e": {
    icon: "/address-icons/dex-liquidswap.png",
    description: "LiquidSwap v0.5 AMM upgrade on Aptos (historical).",
  },
  "0x54cb0bb2c18564b86e34539b9f89cfe1186e39d89fce54e1cd007b8e61673a85": {
    icon: "/address-icons/dex-liquidswap.png",
    description: "LiquidSwap v1 pools and swaps on Aptos.",
  },
  "0xb247ddeee87e848315caf9a33b8e4c71ac53db888cb88143d62d2370cca0ead2": {
    icon: "/address-icons/dex-liquidswap.png",
    description: "LiquidSwap v1 farming and incentives on Aptos.",
  },
  "0x80273859084bc47f92a6c2d3e9257ebb2349668a1b0fb3db1d759a04c7628855": {
    icon: "/address-icons/dex-liquidswap.png",
    description: "LiquidSwap router and aggregation entry points on Aptos.",
  },
  "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c": {
    icon: "/address-icons/dex-sushiswap.png",
    description:
      "SushiSwap on Aptos (historical / defunct deployment for this address).",
  },
  "0xa5d3ac4d429052674ed38adc62d010e52d7c24ca159194d17ddc196ddb7e480b": {
    icon: "/address-icons/dex-aptoswap.png",
    description: "AptoSwap protocol account on Aptos (historical).",
  },
  "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541": {
    icon: "/address-icons/dex-aux.png",
    description: "Aux Exchange on Aptos (historical).",
  },
  "0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1": {
    icon: "/address-icons/dex-cellana.png",
    description:
      "Cellana Finance AMM and liquidity pools on Aptos (Uniswap-v3-style hooks).",
  },
  "0xea098f1fa9245447c792d18c069433f5da2904358e1e340c55bdc68a8f5fe037": {
    icon: "/address-icons/dex-cellana.png",
    description: "Cellana rewards, staking, and emissions contracts on Aptos.",
  },
  "0x1c3206329806286fd2223647c9f9b130e66baeb6d7224a18c1f642ffe48f3b4c": {
    icon: "/address-icons/dex-panora.png",
    description:
      "Panora Exchange: swap aggregation and trading infrastructure on Aptos.",
  },
  "0x9538c839fe490ccfaf32ad9f7491b5e84e610ff6edc110ff883f06ebde82463d": {
    icon: "/address-icons/dex-kanalabs.svg",
    description: "Kana Labs trading and bot infrastructure contracts on Aptos.",
  },
  "0xc0deb00c405f84c85dc13442e305df75d1288100cdd82675695f6148c7ece51c": {
    icon: "/address-icons/dex-econia.png",
    description:
      "Econia Labs on-chain order book (CLOB) on Aptos — defunct / historical for this address. Logo from @EconiaLabs on X (via unavatar.io).",
  },
  "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c": {
    icon: "/address-icons/dex-hyperion.png",
    description: "Hyperion DEX and liquidity modules on Aptos.",
  },
  "0x487e905f899ccb6d46fdaec56ba1e0c4cf119862a16c409904b8c78fab1f5e8a": {
    icon: "/address-icons/dex-tapp.png",
    description: "Tapp Exchange AMM and pool contracts on Aptos.",
  },
  "0xec42a352cc65eca17a9fa85d0fc602295897ed6b8b8af6a6c79ef490eb8f9eba": {
    icon: "/address-icons/dex-cetus.png",
    description: "Cetus protocol (earlier deployment) on Aptos — historical.",
  },
  "0xa7f01413d33ba919441888637ca1607ca0ddcbfa3c0a9ddea64743aaa560e498": {
    icon: "/address-icons/dex-cetus.png",
    description: "Cetus protocol (follow-on deployment) on Aptos — historical.",
  },
  "0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c": {
    icon: "/address-icons/dex-anime.png",
    description: "AnimeSwap AMM on Aptos (historical).",
  },

  // CEX hot wallets / treasury (labels are directional, not proof of custody)
  "0xd91c64b777e51395c6ea9dec562ed79a4afa0cd6dad5a87b187c37198a1f855a": {
    icon: "/address-icons/binance.svg",
    description:
      "Address commonly associated with Binance deposit and withdrawal flows on Aptos.",
  },
  "0x80174e0fe8cb2d32b038c6c888dd95c3e1560736f0d4a6e8bed6ae43b5c91f6f": {
    icon: "/address-icons/binance.svg",
    description:
      "Address commonly associated with Binance deposit and withdrawal flows on Aptos.",
  },
  "0xae1a6f3d3daccaf77b55044cea133379934bba04a11b9d0bbd643eae5e6e9c70": {
    icon: "/address-icons/binance.svg",
    description:
      "Address commonly associated with Binance deposit and withdrawal flows on Aptos.",
  },
  "0x1d14ee0c332546658b13965a39faf5ec24ad195b722435d9fe23dc55487e67e3": {
    icon: "/address-icons/binance.svg",
    description:
      "Address commonly associated with Binance deposit and withdrawal flows on Aptos.",
  },
  "0x33f91e694d40ca0a14cb84e1f27a4d03de5cf292b07ed75ed3286e4f243dab34": {
    icon: "/address-icons/binance.svg",
    description:
      "Address commonly associated with Binance deposit and withdrawal flows on Aptos.",
  },
  "0x5bd7de5c56d5691f32ea86c973c73fec7b1445e59736c97158020018c080bb00": {
    icon: "/address-icons/binance.svg",
    description:
      "Address commonly associated with Binance deposit and withdrawal flows on Aptos.",
  },
  "0xbdb53eb583ba02ab0606bdfc71b59a191400f75fb62f9df124494ab877cdfe2a": {
    icon: "/address-icons/binance.svg",
    description:
      "Address commonly associated with Binance deposit and withdrawal flows on Aptos.",
  },
  "0xed8c46bec9dbc2b23c60568f822b95b87ea395f7e3fdb5e3adc0a30c55c0a60e": {
    icon: "/address-icons/binance.svg",
    description:
      "Address commonly associated with Binance deposit and withdrawal flows on Aptos.",
  },
  "0x81701e60a8e783aecf4dd5e5c9eb76f70a4431bb7441309dc3c6099f2c9e63d5": {
    icon: "/address-icons/cex-binance-us.svg",
    description: "Address commonly associated with Binance.US flows on Aptos.",
  },
  "0x0b3581f46ac8a6920fc9b87fecb7b459b9b39c177e65233826a7b4978bad41cd": {
    icon: "/address-icons/coinbase.svg",
    description:
      "Address commonly associated with Coinbase customer deposit and withdrawal activity on Aptos.",
  },
  "0xa4e7455d27731ab857e9701b1e6ed72591132b909fe6e4fd99b66c1d6318d9e8": {
    icon: "/address-icons/coinbase.svg",
    description:
      "Address commonly associated with Coinbase customer deposit and withdrawal activity on Aptos.",
  },
  "0x834d639b10d20dcb894728aa4b9b572b2ea2d97073b10eacb111f338b20ea5d7": {
    icon: "/address-icons/okx.svg",
    description:
      "Address commonly associated with OKX deposit and withdrawal flows on Aptos.",
  },
  "0x8f347361a9461e9312a4d2b5b5b928c65c3a740965705361317e3ca0015c64d8": {
    icon: "/address-icons/okx.svg",
    description:
      "Address commonly associated with OKX deposit and withdrawal flows on Aptos.",
  },
  "0x966e3ee07a3403a72f44c53f457d34c7148c2c8812c8d52509f54d4a00a36c41": {
    icon: "/address-icons/okx.svg",
    description:
      "Address commonly associated with OKX deposit and withdrawal flows on Aptos.",
  },
  "0x51c6abe562e755582d268340b2cf0e2d8895a155dc9b7a7fb5465000d62d770b": {
    icon: "/address-icons/okx.svg",
    description:
      "Address commonly associated with OKX deposit and withdrawal flows on Aptos.",
  },
  "0x3621fa917ffef3f0509f5d5953672a69791df329139644d89d0a1b0beb98c585": {
    icon: "/address-icons/okx.svg",
    description:
      "Address commonly associated with OKX deposit and withdrawal flows on Aptos.",
  },
  "0x4c1ef44079cb31851349fba50d385f708a10ec7ac612859fdbf28888d1f7b572": {
    icon: "/address-icons/okx.svg",
    description:
      "Address commonly associated with OKX deposit and withdrawal flows on Aptos.",
  },
  "0x84b1675891d370d5de8f169031f9c3116d7add256ecf50a4bc71e3135ddba6e0": {
    icon: "/address-icons/cex-bybit.svg",
    description:
      "Address commonly associated with Bybit deposit and withdrawal flows on Aptos.",
  },
  "0xfd9192f8ad8dc60c483a884f0fbc8940f5b8618f3cf2bbf91693982b373dfdea": {
    icon: "/address-icons/cex-bitfinex.svg",
    description:
      "Address commonly associated with Bitfinex-related settlement on Aptos.",
  },
  "0xdc7adffa09da5736ce1303f7441f4367fa423617c6822ad2fbc8522d9efd8fa4": {
    icon: "/address-icons/cex-kraken.svg",
    description:
      "Address commonly associated with Kraken deposit and withdrawal flows on Aptos.",
  },
  "0x7ec963a7f9a4ee5d87e9431f5646162626c35774c799f4181d574f0ba938bf38": {
    icon: "/address-icons/cex-kraken.svg",
    description:
      "Address commonly associated with Kraken staking or treasury flows on Aptos.",
  },
  "0x0cf869189c785beaaad2f5c636ced4805aeae9cbf49070dc93aed2f16b99012a": {
    icon: "/address-icons/cex-gate.svg",
    description:
      "Address commonly associated with Gate.io deposit and withdrawal flows on Aptos.",
  },
  "0xe8ca094fec460329aaccc2a644dc73c5e39f1a2ad6e97f82b6cbdc1a5949b9ea": {
    icon: "/address-icons/cex-mexc.svg",
    description:
      "Address commonly associated with MEXC deposit and withdrawal flows on Aptos.",
  },
  "0xde084991b91637a08e4da2f1b398f5f935e1393b65d13cc99c597ec5dc105b6b": {
    icon: "/address-icons/cex-cryptocom.svg",
    description:
      "Address commonly associated with Crypto.com customer flows on Aptos.",
  },
  "0x0613f31af70ce983b9dca574e033a52351fd2e67b1959bf48574c6e9c956f95e": {
    icon: "/address-icons/cex-flipster.svg",
    description:
      "Address commonly associated with Flipster / trading-platform flows on Aptos.",
  },
  "0xe46614656e3c58e1bec32b63eafae5e9a5fec44bf14b6a8848d202c10054c5a6": {
    icon: "/address-icons/kucoin.svg",
    description:
      "Address commonly associated with KuCoin deposit and withdrawal flows on Aptos.",
  },
};

export const mainnetKnownAddressBranding: Record<string, KnownAddressBranding> =
  {
    ...aptosFrameworkAddressBranding,
    ...mainnetLabeledBranding,
    "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06": {
      icon: "/address-icons/decibel.png",
      description:
        "Decibel is an onchain trading engine on Aptos for spot, perpetuals, and unified margin—built for transparent execution and deep liquidity.",
    },
  };
