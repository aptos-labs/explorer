// Re-export all constants from lib/constants for backwards compatibility
export * from "./lib/constants";

// Re-export network-specific data from data module
// These exports provide backward compatibility while supporting network-specific data
export {
  // Backward compatible exports (mainnet by default)
  knownAddresses,
  scamAddresses,
  HardCodedCoins,
  nativeTokens,
  manuallyVerifiedTokens,
  labsBannedTokens,
  labsBannedAddresses,
  labsBannedTokenSymbols,
  labsBannedCollections,
  supplyLimitOverrides,
  MARKED_AS_SCAM,
  EMOJICOIN_REGISTRY_ADDRESS,
  // Network-specific getters
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
} from "./data";

// Re-export hooks for React components
export {
  useNetworkData,
  useKnownAddresses,
  useScamAddresses,
  useHardCodedCoins,
  useNativeTokens,
  useVerifiedTokens,
  useBannedTokens,
  useBannedAddresses,
  useBannedTokenSymbols,
  useBannedCollections,
  useSupplyLimitOverrides,
  useKnownAddressName,
  useIsScamAddress,
  useIsTokenBanned,
  useIsAddressBanned,
  useIsTokenSymbolBanned,
  useIsCollectionBanned,
  useHardCodedCoin,
  useIsNativeToken,
  useIsTokenVerified,
  useVerifiedTokenSymbol,
} from "./data/hooks";

// Re-export CoinDescription type for consumers
export type {CoinDescription} from "./api/hooks/useGetCoinList";
