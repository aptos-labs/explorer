// Re-export all constants from lib/constants for backwards compatibility

// Re-export CoinDescription type for consumers
export type {CoinDescription} from "./api/hooks/useGetCoinList";
export type {KnownAddressBranding} from "./data";

// Re-export network-specific data from data module
// These exports provide backward compatibility while supporting network-specific data
export {
  EMOJICOIN_REGISTRY_ADDRESS,
  getBannedAddresses,
  getBannedCollections,
  getBannedTokenSymbols,
  getBannedTokens,
  getHardCodedCoins,
  getKnownAddressBranding,
  getKnownAddressBrandingMap,
  getKnownAddresses,
  getKnownAddressIcon,
  getNativeTokens,
  // Network-specific getters
  getNetworkData,
  getScamAddresses,
  getSupplyLimitOverrides,
  getVerifiedTokens,
  HardCodedCoins,
  // Backward compatible exports (mainnet by default)
  knownAddressBranding,
  knownAddresses,
  labsBannedAddresses,
  labsBannedCollections,
  labsBannedTokenSymbols,
  labsBannedTokens,
  MARKED_AS_SCAM,
  manuallyVerifiedTokens,
  nativeTokens,
  scamAddresses,
  supplyLimitOverrides,
} from "./data";

// Re-export hooks for React components
export {
  useBannedAddresses,
  useBannedCollections,
  useBannedTokenSymbols,
  useBannedTokens,
  useHardCodedCoin,
  useHardCodedCoins,
  useIsAddressBanned,
  useIsCollectionBanned,
  useIsNativeToken,
  useIsScamAddress,
  useIsTokenBanned,
  useIsTokenSymbolBanned,
  useIsTokenVerified,
  useNativeTokens,
  useNetworkData,
  useScamAddresses,
  useSupplyLimitOverrides,
  useVerifiedTokenSymbol,
  useVerifiedTokens,
} from "./data/hooks";
export * from "./lib/constants";
