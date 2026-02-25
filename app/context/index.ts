export type {GlobalState} from "../global-config";
// Re-export network state from global-config (consolidated state management)
export {
  useGlobalState,
  useNetworkName,
  useNetworkSelector,
  useNetworkValue,
  useSdkV2Client,
} from "../global-config";
export {ProvideColorMode, useColorMode} from "./color-mode";
export {WalletAdapterProvider} from "./wallet-adapter";
