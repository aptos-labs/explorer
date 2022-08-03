import {createContext, useContext} from "react";
import {Types} from "aptos";

export interface walletContext {
  isInstalled: boolean;
  isConnected: boolean;
  accountAddress: string | null;
  connect: () => Promise<void>;
  processTransaction: (transactionPayload: Types.TransactionPayload) => Promise<void>;
}

export const walletContext = createContext<walletContext | null>(null);

export const useWalletContext = () => {
  const context = useContext(walletContext) as walletContext;

  if (!context) {
    throw new Error("useWalletContext must be used within a walletContext");
  }
  return context;
};
