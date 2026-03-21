import type {DefunctProtocol, WithdrawalPlugin} from "../types/defunctProtocol";
import {validateWithdrawalPlugin} from "../types/defunctProtocol";

/**
 * Registry of defunct protocols on Aptos Mainnet.
 *
 * To mark a protocol as defunct, add an entry here with at minimum:
 * - address, name, category, status, description, hasWithdrawalPlugin
 *
 * If a withdrawal plugin is available, add it to the `withdrawalPlugins` map
 * below. The plugin must satisfy the 90% owner requirement (validated at load).
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
    hasWithdrawalPlugin: false,
  },
  {
    address:
      "0xa5d3ac4d429052674ed38adc62d010e52d7c24ca159194d17ddc196ddb7e480b",
    name: "AptoSwap",
    category: "DEX",
    status: "defunct",
    description: "Early Aptos DEX that is no longer operational.",
    hasWithdrawalPlugin: false,
  },
  {
    address:
      "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541",
    name: "AuxExchange",
    category: "DEX",
    status: "defunct",
    description: "Automated market maker and order book DEX that shut down.",
    hasWithdrawalPlugin: false,
  },
  {
    address:
      "0xec42a352cc65eca17a9fa85d0fc602295897ed6b8b8af6a6c79ef490eb8f9eba",
    name: "Cetus 1",
    category: "DEX",
    status: "defunct",
    description:
      "First deployment of Cetus concentrated liquidity DEX (superseded by newer deployment).",
    hasWithdrawalPlugin: false,
  },
  {
    address:
      "0xa7f01413d33ba919441888637ca1607ca0ddcbfa3c0a9ddea64743aaa560e498",
    name: "Cetus 2",
    category: "DEX",
    status: "defunct",
    description:
      "Second deployment of Cetus concentrated liquidity DEX (superseded).",
    hasWithdrawalPlugin: false,
  },
  {
    address:
      "0xc7ea756470f72ae761b7986e4ed6fd409aad183b1b2d3d2f674d979852f45c4b",
    name: "Obric",
    category: "DEX",
    status: "defunct",
    description: "Intent-based DEX that is no longer active on Aptos.",
    hasWithdrawalPlugin: false,
  },
  {
    address:
      "0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c",
    name: "AnimeSwap",
    category: "DEX",
    status: "defunct",
    description: "Anime-themed DEX on Aptos that ceased operations.",
    hasWithdrawalPlugin: false,
  },
];

/**
 * Withdrawal plugins registered for defunct protocols.
 * Keyed by protocol address.
 *
 * Every plugin is validated at module load time to ensure the 90%
 * owner-withdrawal invariant is satisfied. Invalid plugins throw
 * at startup so misconfiguration is caught early.
 *
 * To add a withdrawal plugin:
 * 1. Add an entry here keyed by the protocol address
 * 2. Set ownerPercentage >= 90
 * 3. Provide the entry function that handles the withdrawal
 * 4. Set hasWithdrawalPlugin: true on the corresponding DefunctProtocol
 */
export const withdrawalPlugins: Record<string, WithdrawalPlugin> = {
  // Example (commented out) — uncomment and fill in when a real plugin exists:
  // "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c": {
  //   protocolAddress: "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c",
  //   entryFunction: "0x...::sushi_withdraw::withdraw_liquidity",
  //   description: "Withdraw remaining liquidity from SushiSwap pools. 95% returned to the original LP provider, 5% to the rescue operator.",
  //   ownerPercentage: 95,
  // },
};

// Validate all registered plugins at load time
for (const [addr, plugin] of Object.entries(withdrawalPlugins)) {
  const result = validateWithdrawalPlugin(plugin);
  if (!result.valid) {
    throw new Error(`Invalid withdrawal plugin for ${addr}: ${result.error}`);
  }
}

/** Look up a defunct protocol by address */
export function getDefunctProtocol(
  address: string,
): DefunctProtocol | undefined {
  return defunctProtocols.find(
    (p) => p.address.toLowerCase() === address.toLowerCase(),
  );
}

/** Look up a withdrawal plugin by protocol address */
export function getWithdrawalPlugin(
  protocolAddress: string,
): WithdrawalPlugin | undefined {
  const key = Object.keys(withdrawalPlugins).find(
    (k) => k.toLowerCase() === protocolAddress.toLowerCase(),
  );
  return key ? withdrawalPlugins[key] : undefined;
}
