/**
 * Network-specific data loader
 *
 * This module provides unified access to network-specific data including:
 * - Known addresses (labeled accounts like DEXes, bridges, etc.)
 * - Hardcoded coin metadata
 * - Verified/banned tokens and addresses
 * - Supply limit overrides
 */

import {NetworkName} from "../lib/constants";
import {CoinDescription} from "../api/hooks/useGetCoinList";

// Mainnet data
import {
  mainnetKnownAddresses,
  mainnetScamAddresses,
} from "./mainnet/knownAddresses";
import {
  mainnetHardCodedCoins,
  mainnetNativeTokens,
  mainnetVerifiedTokens,
  mainnetBannedTokens,
  mainnetBannedAddresses,
  mainnetBannedTokenSymbols,
  mainnetBannedCollections,
  mainnetSupplyLimitOverrides,
} from "./mainnet/assets";

// Testnet data
import {
  testnetKnownAddresses,
  testnetScamAddresses,
} from "./testnet/knownAddresses";
import {
  testnetHardCodedCoins,
  testnetNativeTokens,
  testnetVerifiedTokens,
  testnetBannedTokens,
  testnetBannedAddresses,
  testnetBannedTokenSymbols,
  testnetBannedCollections,
  testnetSupplyLimitOverrides,
} from "./testnet/assets";

// Devnet data
import {
  devnetKnownAddresses,
  devnetScamAddresses,
} from "./devnet/knownAddresses";
import {
  devnetHardCodedCoins,
  devnetNativeTokens,
  devnetVerifiedTokens,
  devnetBannedTokens,
  devnetBannedAddresses,
  devnetBannedTokenSymbols,
  devnetBannedCollections,
  devnetSupplyLimitOverrides,
} from "./devnet/assets";

// Type definitions for data structures
export interface NetworkData {
  knownAddresses: Record<string, string>;
  scamAddresses: Record<string, string>;
  hardCodedCoins: Record<string, CoinDescription>;
  nativeTokens: Record<string, string>;
  verifiedTokens: Record<string, string>;
  bannedTokens: Record<string, string>;
  bannedAddresses: Record<string, string>;
  bannedTokenSymbols: Record<string, string>;
  bannedCollections: Record<string, string>;
  supplyLimitOverrides: Record<string, bigint>;
}

// Network data registry
const networkDataRegistry: Record<string, NetworkData> = {
  mainnet: {
    knownAddresses: mainnetKnownAddresses,
    scamAddresses: mainnetScamAddresses,
    hardCodedCoins: mainnetHardCodedCoins,
    nativeTokens: mainnetNativeTokens,
    verifiedTokens: mainnetVerifiedTokens,
    bannedTokens: mainnetBannedTokens,
    bannedAddresses: mainnetBannedAddresses,
    bannedTokenSymbols: mainnetBannedTokenSymbols,
    bannedCollections: mainnetBannedCollections,
    supplyLimitOverrides: mainnetSupplyLimitOverrides,
  },
  testnet: {
    knownAddresses: testnetKnownAddresses,
    scamAddresses: testnetScamAddresses,
    hardCodedCoins: testnetHardCodedCoins,
    nativeTokens: testnetNativeTokens,
    verifiedTokens: testnetVerifiedTokens,
    bannedTokens: testnetBannedTokens,
    bannedAddresses: testnetBannedAddresses,
    bannedTokenSymbols: testnetBannedTokenSymbols,
    bannedCollections: testnetBannedCollections,
    supplyLimitOverrides: testnetSupplyLimitOverrides,
  },
  devnet: {
    knownAddresses: devnetKnownAddresses,
    scamAddresses: devnetScamAddresses,
    hardCodedCoins: devnetHardCodedCoins,
    nativeTokens: devnetNativeTokens,
    verifiedTokens: devnetVerifiedTokens,
    bannedTokens: devnetBannedTokens,
    bannedAddresses: devnetBannedAddresses,
    bannedTokenSymbols: devnetBannedTokenSymbols,
    bannedCollections: devnetBannedCollections,
    supplyLimitOverrides: devnetSupplyLimitOverrides,
  },
};

// Default to mainnet data for unknown networks
const defaultNetworkData = networkDataRegistry.mainnet;

/**
 * Get all network data for a specific network
 */
export function getNetworkData(networkName: NetworkName): NetworkData {
  return networkDataRegistry[networkName] ?? defaultNetworkData;
}

/**
 * Get known addresses for a specific network
 */
export function getKnownAddresses(
  networkName: NetworkName,
): Record<string, string> {
  return getNetworkData(networkName).knownAddresses;
}

/**
 * Get scam addresses for a specific network
 */
export function getScamAddresses(
  networkName: NetworkName,
): Record<string, string> {
  return getNetworkData(networkName).scamAddresses;
}

/**
 * Get hardcoded coins for a specific network
 */
export function getHardCodedCoins(
  networkName: NetworkName,
): Record<string, CoinDescription> {
  return getNetworkData(networkName).hardCodedCoins;
}

/**
 * Get native tokens for a specific network
 */
export function getNativeTokens(
  networkName: NetworkName,
): Record<string, string> {
  return getNetworkData(networkName).nativeTokens;
}

/**
 * Get verified tokens for a specific network
 */
export function getVerifiedTokens(
  networkName: NetworkName,
): Record<string, string> {
  return getNetworkData(networkName).verifiedTokens;
}

/**
 * Get banned tokens for a specific network
 */
export function getBannedTokens(
  networkName: NetworkName,
): Record<string, string> {
  return getNetworkData(networkName).bannedTokens;
}

/**
 * Get banned addresses for a specific network
 */
export function getBannedAddresses(
  networkName: NetworkName,
): Record<string, string> {
  return getNetworkData(networkName).bannedAddresses;
}

/**
 * Get banned token symbols for a specific network
 */
export function getBannedTokenSymbols(
  networkName: NetworkName,
): Record<string, string> {
  return getNetworkData(networkName).bannedTokenSymbols;
}

/**
 * Get banned collections for a specific network
 */
export function getBannedCollections(
  networkName: NetworkName,
): Record<string, string> {
  return getNetworkData(networkName).bannedCollections;
}

/**
 * Get supply limit overrides for a specific network
 */
export function getSupplyLimitOverrides(
  networkName: NetworkName,
): Record<string, bigint> {
  return getNetworkData(networkName).supplyLimitOverrides;
}

// Re-export mainnet data for backward compatibility
// TODO: Migrate all consumers to use network-specific functions
export {mainnetKnownAddresses as knownAddresses};
export {mainnetScamAddresses as scamAddresses};
export {mainnetHardCodedCoins as HardCodedCoins};
export {mainnetNativeTokens as nativeTokens};
export {mainnetVerifiedTokens as manuallyVerifiedTokens};
export {mainnetBannedTokens as labsBannedTokens};
export {mainnetBannedAddresses as labsBannedAddresses};
export {mainnetBannedTokenSymbols as labsBannedTokenSymbols};
export {mainnetBannedCollections as labsBannedCollections};
export {mainnetSupplyLimitOverrides as supplyLimitOverrides};

// Export MARKED_AS_SCAM constant
export const MARKED_AS_SCAM = "Marked as scam";

// Export emojicoin registry address (mainnet only for now)
export const EMOJICOIN_REGISTRY_ADDRESS =
  "0x4b947ed016c64bde81972d69ea7d356de670d57fd2608b129f4d94ac0d0ee61";
