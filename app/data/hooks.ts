/**
 * React hooks for accessing network-specific data
 *
 * These hooks provide convenient access to network-specific data
 * based on the current network context.
 */

import {useMemo} from "react";
import {useNetworkName} from "../global-config/GlobalConfig";
import {CoinDescription} from "../api/hooks/useGetCoinList";
import {
  getNetworkData,
  getKnownAddresses,
  getScamAddresses,
  getHardCodedCoins,
  getNativeTokens,
  getVerifiedTokens,
  getBannedTokens,
  getBannedAddresses,
  getBannedTokenSymbols,
  getBannedCollections,
  getSupplyLimitOverrides,
  NetworkData,
} from "./index";

/**
 * Hook to get all network data for the current network
 */
export function useNetworkData(): NetworkData {
  const networkName = useNetworkName();
  return useMemo(() => getNetworkData(networkName), [networkName]);
}

/**
 * Hook to get known addresses for the current network
 */
export function useKnownAddresses(): Record<string, string> {
  const networkName = useNetworkName();
  return useMemo(() => getKnownAddresses(networkName), [networkName]);
}

/**
 * Hook to get scam addresses for the current network
 */
export function useScamAddresses(): Record<string, string> {
  const networkName = useNetworkName();
  return useMemo(() => getScamAddresses(networkName), [networkName]);
}

/**
 * Hook to get hardcoded coins for the current network
 */
export function useHardCodedCoins(): Record<string, CoinDescription> {
  const networkName = useNetworkName();
  return useMemo(() => getHardCodedCoins(networkName), [networkName]);
}

/**
 * Hook to get native tokens for the current network
 */
export function useNativeTokens(): Record<string, string> {
  const networkName = useNetworkName();
  return useMemo(() => getNativeTokens(networkName), [networkName]);
}

/**
 * Hook to get verified tokens for the current network
 */
export function useVerifiedTokens(): Record<string, string> {
  const networkName = useNetworkName();
  return useMemo(() => getVerifiedTokens(networkName), [networkName]);
}

/**
 * Hook to get banned tokens for the current network
 */
export function useBannedTokens(): Record<string, string> {
  const networkName = useNetworkName();
  return useMemo(() => getBannedTokens(networkName), [networkName]);
}

/**
 * Hook to get banned addresses for the current network
 */
export function useBannedAddresses(): Record<string, string> {
  const networkName = useNetworkName();
  return useMemo(() => getBannedAddresses(networkName), [networkName]);
}

/**
 * Hook to get banned token symbols for the current network
 */
export function useBannedTokenSymbols(): Record<string, string> {
  const networkName = useNetworkName();
  return useMemo(() => getBannedTokenSymbols(networkName), [networkName]);
}

/**
 * Hook to get banned collections for the current network
 */
export function useBannedCollections(): Record<string, string> {
  const networkName = useNetworkName();
  return useMemo(() => getBannedCollections(networkName), [networkName]);
}

/**
 * Hook to get supply limit overrides for the current network
 */
export function useSupplyLimitOverrides(): Record<string, bigint> {
  const networkName = useNetworkName();
  return useMemo(() => getSupplyLimitOverrides(networkName), [networkName]);
}

/**
 * Hook to look up a known address name
 * Returns undefined if the address is not known
 */
export function useKnownAddressName(address: string): string | undefined {
  const knownAddresses = useKnownAddresses();
  return useMemo(() => knownAddresses[address], [knownAddresses, address]);
}

/**
 * Hook to check if an address is a known scam
 */
export function useIsScamAddress(address: string): boolean {
  const scamAddresses = useScamAddresses();
  return useMemo(() => address in scamAddresses, [scamAddresses, address]);
}

/**
 * Hook to check if a token is banned
 */
export function useIsTokenBanned(tokenAddress: string): boolean {
  const bannedTokens = useBannedTokens();
  return useMemo(
    () => tokenAddress in bannedTokens,
    [bannedTokens, tokenAddress],
  );
}

/**
 * Hook to check if an address is banned
 */
export function useIsAddressBanned(address: string): boolean {
  const bannedAddresses = useBannedAddresses();
  return useMemo(() => address in bannedAddresses, [bannedAddresses, address]);
}

/**
 * Hook to check if a token symbol is banned
 */
export function useIsTokenSymbolBanned(symbol: string): boolean {
  const bannedSymbols = useBannedTokenSymbols();
  return useMemo(() => symbol in bannedSymbols, [bannedSymbols, symbol]);
}

/**
 * Hook to check if a collection is banned
 */
export function useIsCollectionBanned(collectionAddress: string): boolean {
  const bannedCollections = useBannedCollections();
  return useMemo(
    () => collectionAddress in bannedCollections,
    [bannedCollections, collectionAddress],
  );
}

/**
 * Hook to get a hardcoded coin by address
 */
export function useHardCodedCoin(address: string): CoinDescription | undefined {
  const hardCodedCoins = useHardCodedCoins();
  return useMemo(() => hardCodedCoins[address], [hardCodedCoins, address]);
}

/**
 * Hook to check if an address is a native token
 */
export function useIsNativeToken(address: string): boolean {
  const nativeTokens = useNativeTokens();
  return useMemo(() => address in nativeTokens, [nativeTokens, address]);
}

/**
 * Hook to check if a token is verified
 */
export function useIsTokenVerified(address: string): boolean {
  const verifiedTokens = useVerifiedTokens();
  return useMemo(() => address in verifiedTokens, [verifiedTokens, address]);
}

/**
 * Hook to get the verified token symbol
 */
export function useVerifiedTokenSymbol(address: string): string | undefined {
  const verifiedTokens = useVerifiedTokens();
  return useMemo(() => verifiedTokens[address], [verifiedTokens, address]);
}
