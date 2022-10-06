import {createContext, useContext} from "react";

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

export type WalletNetworks = "devnet" | "testnet";
