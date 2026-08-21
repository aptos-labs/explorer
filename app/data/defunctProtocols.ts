import type {DefunctProtocol, WithdrawalPlugin} from "../types/defunctProtocol";
import {validateWithdrawalPlugin} from "../types/defunctProtocol";
import {tryStandardizeAddress} from "../utils";

/**
 * Registry of defunct protocols on Aptos Mainnet.
 *
 * To mark a protocol as defunct, add an entry here with at minimum:
 * - address, name, category, status, description
 *
 * Known-address labels in `mainnet/knownAddresses.ts` that carry a
 * `// defunct`, `// winding_down`, or `// deprecated` comment MUST have a
 * matching entry here (enforced by `defunctProtocols.test.ts`) so account
 * pages show the defunct banner.
 *
 * If a withdrawal plugin is available, add it to the `withdrawalPluginsRaw`
 * map below. The plugin must satisfy the 90% owner requirement (validated at
 * load).
 */
export const defunctProtocols: DefunctProtocol[] = [
  {
    address:
      "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c",
    name: "SushiSwap",
    category: "DEX",
    status: "defunct",
    description:
      "Decentralized exchange that ceased operations on Aptos. Liquidity pools may still hold user funds.",
  },
  {
    address:
      "0xa5d3ac4d429052674ed38adc62d010e52d7c24ca159194d17ddc196ddb7e480b",
    name: "AptoSwap",
    category: "DEX",
    status: "defunct",
    description: "Early Aptos DEX that is no longer operational.",
  },
  {
    address:
      "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541",
    name: "AuxExchange",
    category: "DEX",
    status: "defunct",
    description: "Automated market maker and order book DEX that shut down.",
  },
  {
    address:
      "0xec42a352cc65eca17a9fa85d0fc602295897ed6b8b8af6a6c79ef490eb8f9eba",
    name: "Cetus 1",
    category: "DEX",
    status: "defunct",
    description:
      "First deployment of Cetus concentrated liquidity DEX (superseded by newer deployment).",
  },
  {
    address:
      "0xa7f01413d33ba919441888637ca1607ca0ddcbfa3c0a9ddea64743aaa560e498",
    name: "Cetus 2",
    category: "DEX",
    status: "defunct",
    description:
      "Second deployment of Cetus concentrated liquidity DEX (superseded).",
  },
  {
    address:
      "0xc7ea756470f72ae761b7986e4ed6fd409aad183b1b2d3d2f674d979852f45c4b",
    name: "Obric",
    category: "DEX",
    status: "defunct",
    description: "Intent-based DEX that is no longer active on Aptos.",
  },
  {
    address:
      "0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c",
    name: "AnimeSwap",
    category: "DEX",
    status: "defunct",
    description: "Anime-themed DEX on Aptos that ceased operations.",
  },
  {
    address:
      "0xc0deb00c405f84c85dc13442e305df75d1288100cdd82675695f6148c7ece51c",
    name: "Econia Labs",
    category: "DEX",
    status: "defunct",
    description:
      "On-chain CLOB that Econia Labs wound down in September 2025. The Move package remains on-chain but is no longer maintained.",
    defunctDate: "2025-09-08",
    infoUrl: "https://econia.dev/",
  },
  {
    address:
      "0x487e905f899ccb6d46fdaec56ba1e0c4cf119862a16c409904b8c78fab1f5e8a",
    name: "Tapp Exchange",
    category: "DEX",
    status: "defunct",
    description:
      "V4-style DEX that ceased operations on 31 May 2026. The frontend was taken offline; remaining liquidity may still sit in on-chain pools.",
    defunctDate: "2026-05-31",
  },
  {
    address:
      "0xb7d960e5f0a58cc0817774e611d7e3ae54c6843816521f02d7ced583d6434896",
    name: "Aptin Finance v1",
    category: "Lending",
    status: "defunct",
    description:
      "First Aptin lending deployment. Aptin wound down operations in 2025; leftover deposits may still be recoverable via the contracts.",
    defunctDate: "2025-09-08",
    infoUrl:
      "https://aptin.medium.com/aptin-protocol-update-service-wind-down-notice-b65129c6ee9b",
  },
  {
    address:
      "0x3c1d4a86594d681ff7e5d5a233965daeabdc6a15fe5672ceeda5260038857183",
    name: "Aptin Finance v2",
    category: "Lending",
    status: "defunct",
    description:
      "Second Aptin lending deployment. The team closed deposits and borrowing in September 2025 and took the frontend offline after 30 November 2025.",
    defunctDate: "2025-09-08",
    infoUrl:
      "https://aptin.medium.com/aptin-protocol-update-service-wind-down-notice-b65129c6ee9b",
  },
  {
    address:
      "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06",
    name: "Merkle Trade",
    category: "DeFi",
    status: "defunct",
    description:
      "Perpetual DEX that sunset on 10 February 2026. Remaining claims are handled through Merkle's wind-down flow.",
    defunctDate: "2026-02-10",
    infoUrl: "https://docs.merkle.trade/sunset-notice",
  },
  {
    address:
      "0xface729284ae5729100b3a9ad7f7cc025ea09739cd6e7252aff0beb53619cafe",
    name: "Emojicoin.fun",
    category: "DeFi",
    status: "defunct",
    description:
      "Emoji-ticker launchpad built by Econia Labs. The team archived the project when Econia wound down in September 2025.",
    defunctDate: "2025-09-08",
    infoUrl: "https://econia.dev/",
  },
  {
    address:
      "0x04b947ed016c64bde81972d69ea7d356de670d57fd2608b129f4d94ac0d0ee61",
    name: "Emojicoin.fun Registry",
    category: "DeFi",
    status: "defunct",
    description:
      "On-chain registry for emojicoin.fun markets. No longer maintained after the Econia Labs wind-down.",
    defunctDate: "2025-09-08",
    infoUrl: "https://econia.dev/",
  },
  {
    address:
      "0xbabe32dbe1cb44c30363894da9f49957d6e2b94a06f2fc5c20a9d1b9e54cface",
    name: "Emojicoin.fun Rewards",
    category: "DeFi",
    status: "defunct",
    description:
      "Rewards contract for emojicoin.fun. No longer maintained after the Econia Labs wind-down.",
    defunctDate: "2025-09-08",
    infoUrl: "https://econia.dev/",
  },
  {
    address:
      "0x2c7bccf7b31baf770fdbcc768d9e9cb3d87805e255355df5db32ac9a669010a2",
    name: "Topaz Marketplace",
    category: "NFT Marketplace",
    status: "defunct",
    description:
      "Aptos NFT marketplace that ceased operations on 21 August 2024. Historical marketplace events remain in the indexer.",
    defunctDate: "2024-08-21",
    infoUrl:
      "https://aptos.dev/build/indexer/nft-aggregator/marketplaces/topaz",
  },
  {
    address:
      "0xf6994988bd40261af9431cd6dd3fcf765569719e66322c7a05cc78a89cd366d4",
    name: "Souffl3 Marketplace",
    category: "NFT Marketplace",
    status: "defunct",
    description:
      "Early Aptos NFT marketplace and launchpad that is no longer operating.",
  },
  {
    address:
      "0x39ddcd9e1a39fa14f25e3f9ec8a86074d05cc0881cbf667df8a6ee70942016fb",
    name: "Aave Pool",
    category: "Lending",
    status: "winding_down",
    description:
      "Aave V3 Aptos pool. The DAO is winding down this deployment: new supply and borrows are frozen so remaining positions can exit.",
    infoUrl:
      "https://governance.aave.com/t/arfc-low-adoption-asset-deprecation-on-aave-v3/25401",
  },
  {
    address:
      "0x34c3e6af238f3a7fa3f3b0088cbc4b194d21f62e65a15b79ae91364de5a81a3a",
    name: "Aave Acl",
    category: "Lending",
    status: "winding_down",
    description:
      "Access-control module for the Aave V3 Aptos deployment, which is winding down.",
    infoUrl:
      "https://governance.aave.com/t/arfc-low-adoption-asset-deprecation-on-aave-v3/25401",
  },
  {
    address:
      "0x531069f4741cdead39d70b76e5779863864654fae6db8a752a244ff2f9916c15",
    name: "Aave Config",
    category: "Lending",
    status: "winding_down",
    description:
      "Config module for the Aave V3 Aptos deployment, which is winding down.",
    infoUrl:
      "https://governance.aave.com/t/arfc-low-adoption-asset-deprecation-on-aave-v3/25401",
  },
  {
    address:
      "0x5eb5cc775c5a446db0f3a1c944e11563b97e6a7e1387b9fb459aa26168f738dc",
    name: "Aave Data",
    category: "Lending",
    status: "winding_down",
    description:
      "Data module for the Aave V3 Aptos deployment, which is winding down.",
    infoUrl:
      "https://governance.aave.com/t/arfc-low-adoption-asset-deprecation-on-aave-v3/25401",
  },
  {
    address:
      "0xc0338eea778de2a5348824ddbfcec033c7f7cbe18da6da40869562906b63c78c",
    name: "Aave Math",
    category: "Lending",
    status: "winding_down",
    description:
      "Math module for the Aave V3 Aptos deployment, which is winding down.",
    infoUrl:
      "https://governance.aave.com/t/arfc-low-adoption-asset-deprecation-on-aave-v3/25401",
  },
  {
    address:
      "0x12b05c42ac3209a3c6ffadff4ebb6c3e983e5115f26031d56652815b49a14245",
    name: "Aave Mock Underlyings",
    category: "Lending",
    status: "winding_down",
    description:
      "Mock underlying tokens for the Aave V3 Aptos deployment, which is winding down.",
    infoUrl:
      "https://governance.aave.com/t/arfc-low-adoption-asset-deprecation-on-aave-v3/25401",
  },
  {
    address:
      "0x249676f3faddb83d64fd101baa3f84a171ae02505d796e3edbf4861038a4b5cc",
    name: "Aave Oracle",
    category: "Lending",
    status: "winding_down",
    description:
      "Oracle module for the Aave V3 Aptos deployment, which is winding down.",
    infoUrl:
      "https://governance.aave.com/t/arfc-low-adoption-asset-deprecation-on-aave-v3/25401",
  },
];

/**
 * Withdrawal plugins registered for defunct protocols.
 * Keyed by protocol address (will be lowercased at load time).
 *
 * Every plugin is validated at module load time to ensure the 90%
 * owner-withdrawal invariant is satisfied. Invalid plugins throw
 * at startup so misconfiguration is caught early.
 *
 * To add a withdrawal plugin:
 * 1. Add an entry here keyed by the protocol address
 * 2. Set ownerPercentage >= 90
 * 3. Provide the entry function that handles the withdrawal
 */
const withdrawalPluginsRaw: Record<string, WithdrawalPlugin> = {
  // Example (commented out) — uncomment and fill in when a real plugin exists:
  // "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c": {
  //   protocolAddress: "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c",
  //   entryFunction: "0x...::sushi_withdraw::withdraw_liquidity",
  //   description: "Withdraw remaining liquidity from SushiSwap pools. 95% returned to the original LP provider, 5% to the rescue operator.",
  //   ownerPercentage: 95,
  // },
};

function requireStandardAddress(address: string, label: string): string {
  const standardized = tryStandardizeAddress(address);
  if (!standardized) {
    throw new Error(`Invalid ${label} address: ${address}`);
  }
  return standardized;
}

/**
 * Normalized withdrawal plugin map with 64-char lowercase keys for O(1) lookup.
 * Built once at module load after validation.
 */
export const withdrawalPlugins: ReadonlyMap<string, WithdrawalPlugin> = (() => {
  const map = new Map<string, WithdrawalPlugin>();
  for (const [addr, plugin] of Object.entries(withdrawalPluginsRaw)) {
    const result = validateWithdrawalPlugin(plugin);
    if (!result.valid) {
      throw new Error(`Invalid withdrawal plugin for ${addr}: ${result.error}`);
    }
    const key = requireStandardAddress(addr, "withdrawal plugin key");
    const protocolKey = requireStandardAddress(
      plugin.protocolAddress,
      "withdrawal plugin protocolAddress",
    );
    if (key !== protocolKey) {
      throw new Error(
        `Withdrawal plugin key "${addr}" does not match protocolAddress "${plugin.protocolAddress}".`,
      );
    }
    map.set(key, plugin);
  }
  return map;
})();

const defunctProtocolsByAddress: ReadonlyMap<string, DefunctProtocol> = (() => {
  const map = new Map<string, DefunctProtocol>();
  for (const protocol of defunctProtocols) {
    const key = requireStandardAddress(
      protocol.address,
      `defunct protocol ${protocol.name}`,
    );
    if (map.has(key)) {
      throw new Error(
        `Duplicate defunct protocol address after standardization: ${key}`,
      );
    }
    map.set(key, protocol);
  }
  return map;
})();

/** Look up a defunct protocol by address (short or 64-char hex). */
export function getDefunctProtocol(
  address: string,
): DefunctProtocol | undefined {
  const key = tryStandardizeAddress(address);
  if (!key) return undefined;
  return defunctProtocolsByAddress.get(key);
}

/** Look up a withdrawal plugin by protocol address (O(1) via normalized map) */
export function getWithdrawalPlugin(
  protocolAddress: string,
): WithdrawalPlugin | undefined {
  const key = tryStandardizeAddress(protocolAddress);
  if (!key) return undefined;
  return withdrawalPlugins.get(key);
}
