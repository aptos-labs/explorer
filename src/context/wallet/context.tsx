import {createContext, useContext} from "react";
import {NetworkName} from "../../constants";
import {assertNever} from "../../utils";

export interface walletContext {
  isInstalled: boolean;
  isConnected: boolean;
  isAccountSet: boolean;
  walletNetwork: WalletNetworks;
  accountAddress: string | null;
  connect: () => Promise<void>;
}

export const walletContext = createContext<walletContext | null>(null);

export const useWalletContext = () => {
  const context = useContext(walletContext) as walletContext;

  if (!context) {
    throw new Error("useWalletContext must be used within a walletContext");
  }
  return context;
};

export type WalletNetworks = "Devnet" | "Localhost" | "Testnet";

export const walletExplorerNetworkMap = (
  walletNetwork: WalletNetworks,
): NetworkName => {
  switch (walletNetwork) {
    case "Devnet":
      return "devnet";
    case "Localhost":
      return "local";
    case "Testnet":
      return "test";
    default:
      return assertNever(walletNetwork);
  }
};
