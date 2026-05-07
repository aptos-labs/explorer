/**
 * Network-specific data loader
 *
 * This module provides unified access to network-specific data including:
 * - Known addresses (labeled accounts like DEXes, bridges, etc.)
 * - Hardcoded coin metadata
 * - Verified/banned tokens and addresses
 * - Supply limit overrides
 */

import type {FaProperties} from "../api/hooks/useGetFaProperties";
import type {CoinDescription} from "../api/hooks/useGetCoinList";
import type {NetworkName} from "../lib/constants";
import {
  type CoinPropertyOverrideMap,
  type FaPropertyOverride,
  lookupCoinPropertyOverride,
} from "./coinPropertyOverrides";
import {
  devnetBannedAddresses,
  devnetBannedCollections,
  devnetBannedTokenSymbols,
  devnetBannedTokens,
  devnetHardCodedCoins,
  devnetNativeTokens,
  devnetSupplyLimitOverrides,
  devnetVerifiedTokens,
} from "./devnet/assets";
import {devnetCoinPropertyOverrides} from "./devnet/coinPropertyOverrides";
// Devnet data
import {devnetKnownAddressBranding} from "./devnet/knownAddressBranding";
import {
  devnetKnownAddresses,
  devnetScamAddresses,
} from "./devnet/knownAddresses";
import type {KnownAddressBranding} from "./knownAddressBranding";
import {
  mainnetBannedAddresses,
  mainnetBannedCollections,
  mainnetBannedTokenSymbols,
  mainnetBannedTokens,
  mainnetHardCodedCoins,
  mainnetNativeTokens,
  mainnetSupplyLimitOverrides,
  mainnetVerifiedTokens,
} from "./mainnet/assets";
import {mainnetCoinPropertyOverrides} from "./mainnet/coinPropertyOverrides";
// Mainnet data
import {mainnetKnownAddressBranding} from "./mainnet/knownAddressBranding";
import {
  mainnetKnownAddresses,
  mainnetScamAddresses,
} from "./mainnet/knownAddresses";
import {
  testnetBannedAddresses,
  testnetBannedCollections,
  testnetBannedTokenSymbols,
  testnetBannedTokens,
  testnetHardCodedCoins,
  testnetNativeTokens,
  testnetSupplyLimitOverrides,
  testnetVerifiedTokens,
} from "./testnet/assets";
import {testnetCoinPropertyOverrides} from "./testnet/coinPropertyOverrides";
// Testnet data
import {testnetKnownAddressBranding} from "./testnet/knownAddressBranding";
import {
  testnetKnownAddresses,
  testnetScamAddresses,
} from "./testnet/knownAddresses";

// Type definitions for data structures
export interface NetworkData {
  knownAddresses: Record<string, string>;
  /** Optional icon + copy for known labeled addresses */
  knownAddressBranding: Record<string, KnownAddressBranding>;
  scamAddresses: Record<string, string>;
  hardCodedCoins: Record<string, CoinDescription>;
  nativeTokens: Record<string, string>;
  verifiedTokens: Record<string, string>;
  bannedTokens: Record<string, string>;
  bannedAddresses: Record<string, string>;
  bannedTokenSymbols: Record<string, string>;
  bannedCollections: Record<string, string>;
  supplyLimitOverrides: Record<string, bigint>;
  coinPropertyOverrides: CoinPropertyOverrideMap;
}

// Network data registry
const networkDataRegistry: Record<string, NetworkData> = {
  mainnet: {
    knownAddresses: mainnetKnownAddresses,
    knownAddressBranding: mainnetKnownAddressBranding,
    scamAddresses: mainnetScamAddresses,
    hardCodedCoins: mainnetHardCodedCoins,
    nativeTokens: mainnetNativeTokens,
    verifiedTokens: mainnetVerifiedTokens,
    bannedTokens: mainnetBannedTokens,
    bannedAddresses: mainnetBannedAddresses,
    bannedTokenSymbols: mainnetBannedTokenSymbols,
    bannedCollections: mainnetBannedCollections,
    supplyLimitOverrides: mainnetSupplyLimitOverrides,
    coinPropertyOverrides: mainnetCoinPropertyOverrides,
  },
  testnet: {
    knownAddresses: testnetKnownAddresses,
    knownAddressBranding: testnetKnownAddressBranding,
    scamAddresses: testnetScamAddresses,
    hardCodedCoins: testnetHardCodedCoins,
    nativeTokens: testnetNativeTokens,
    verifiedTokens: testnetVerifiedTokens,
    bannedTokens: testnetBannedTokens,
    bannedAddresses: testnetBannedAddresses,
    bannedTokenSymbols: testnetBannedTokenSymbols,
    bannedCollections: testnetBannedCollections,
    supplyLimitOverrides: testnetSupplyLimitOverrides,
    coinPropertyOverrides: testnetCoinPropertyOverrides,
  },
  devnet: {
    knownAddresses: devnetKnownAddresses,
    knownAddressBranding: devnetKnownAddressBranding,
    scamAddresses: devnetScamAddresses,
    hardCodedCoins: devnetHardCodedCoins,
    nativeTokens: devnetNativeTokens,
    verifiedTokens: devnetVerifiedTokens,
    bannedTokens: devnetBannedTokens,
    bannedAddresses: devnetBannedAddresses,
    bannedTokenSymbols: devnetBannedTokenSymbols,
    bannedCollections: devnetBannedCollections,
    supplyLimitOverrides: devnetSupplyLimitOverrides,
    coinPropertyOverrides: devnetCoinPropertyOverrides,
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
 * Branding (icon + optional description) for known labeled addresses.
 */
export function getKnownAddressBrandingMap(
  networkName: NetworkName,
): Record<string, KnownAddressBranding> {
  return getNetworkData(networkName).knownAddressBranding;
}

/**
 * Resolved branding for a standardized address, if configured for the network.
 */
export function getKnownAddressBranding(
  networkName: NetworkName,
  standardizedAddress: string,
): KnownAddressBranding | undefined {
  return getKnownAddressBrandingMap(networkName)[standardizedAddress];
}

/**
 * Resolved icon URL or path for a standardized address, if configured.
 */
export function getKnownAddressIcon(
  networkName: NetworkName,
  standardizedAddress: string,
): string | undefined {
  return getKnownAddressBranding(networkName, standardizedAddress)?.icon;
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

/**
 * Get the manual FA-property override map for a specific network.
 */
export function getCoinPropertyOverrideMap(
  networkName: NetworkName,
): CoinPropertyOverrideMap {
  return getNetworkData(networkName).coinPropertyOverrides;
}

/**
 * Resolve a manual FA-property override for the given coin struct or
 * fungible asset metadata address on the specified network.
 *
 * Returns `null` when no override is configured.
 */
export function getCoinPropertyOverride(
  networkName: NetworkName,
  keys: {coinStruct?: string | null; faAddress?: string | null},
): FaPropertyOverride | null {
  return lookupCoinPropertyOverride(
    getCoinPropertyOverrideMap(networkName),
    keys,
  );
}

/**
 * Apply a manual FA-property override (if any) on top of derived properties.
 *
 * - If derived is `null` and an override exists, returns a baseline
 *   `FaProperties` (all `false`) with the override applied.
 * - If derived is `null` and no override exists, returns `null`.
 * - Otherwise, returns derived with any override fields applied last.
 */
export function applyCoinPropertyOverride(
  derived: FaProperties | null,
  override: FaPropertyOverride | null,
): FaProperties | null {
  if (!override) return derived;
  const base: FaProperties = derived ?? {
    mintable: false,
    burnable: false,
    freezable: false,
    dispatchable: false,
    untransferable: false,
  };
  return {...base, ...override};
}

export type {KnownAddressBranding} from "./knownAddressBranding";
export type {
  CoinPropertyOverrideMap,
  FaPropertyOverride,
} from "./coinPropertyOverrides";
// Re-export mainnet data for backward compatibility
// TODO: Migrate all consumers to use network-specific functions
export {
  mainnetBannedAddresses as labsBannedAddresses,
  mainnetBannedCollections as labsBannedCollections,
  mainnetBannedTokenSymbols as labsBannedTokenSymbols,
  mainnetBannedTokens as labsBannedTokens,
  mainnetHardCodedCoins as HardCodedCoins,
  mainnetKnownAddressBranding as knownAddressBranding,
  mainnetKnownAddresses as knownAddresses,
  mainnetNativeTokens as nativeTokens,
  mainnetScamAddresses as scamAddresses,
  mainnetSupplyLimitOverrides as supplyLimitOverrides,
  mainnetVerifiedTokens as manuallyVerifiedTokens,
};

// Export MARKED_AS_SCAM constant
export const MARKED_AS_SCAM = "Marked as scam";

// Export emojicoin registry address (mainnet only for now)
export const EMOJICOIN_REGISTRY_ADDRESS =
  "0x4b947ed016c64bde81972d69ea7d356de670d57fd2608b129f4d94ac0d0ee61";
