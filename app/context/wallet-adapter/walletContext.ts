import type {WalletContextState} from "@aptos-labs/wallet-adapter-react";
import {createContext, useContext} from "react";

const adapterNotLoaded = () =>
  Promise.reject(new Error("Wallet adapter is not loaded"));

/** Wallet state before `@aptos-labs/wallet-adapter-react` has loaded. */
export const disconnectedWalletState: WalletContextState = {
  connected: false,
  isLoading: false,
  account: null,
  network: null,
  wallet: null,
  wallets: [],
  hiddenWallets: [],
  notDetectedWallets: [],
  connect: () => {},
  disconnect: () => {},
  signIn: adapterNotLoaded,
  signAndSubmitTransaction: adapterNotLoaded,
  signTransaction: adapterNotLoaded,
  signMessage: adapterNotLoaded,
  signMessageAndVerify: adapterNotLoaded,
  changeNetwork: adapterNotLoaded,
  submitTransaction: adapterNotLoaded,
};

export const WalletStateContext = createContext<WalletContextState>(
  disconnectedWalletState,
);

export type WalletAdapterLoader = {
  /** True once the real adapter is mounted and reporting state. */
  ready: boolean;
  /** Start loading the adapter (idempotent). */
  load: () => void;
};

export const WalletAdapterLoaderContext = createContext<WalletAdapterLoader>({
  ready: false,
  load: () => {},
});

/**
 * Drop-in for `useWallet` from `@aptos-labs/wallet-adapter-react`. Import this
 * one: the adapter package bundles the full SDK `Aptos` client (~640 kB gzip),
 * so it only loads when a wallet is needed (see `WalletAdapterProvider`).
 */
export function useWallet(): WalletContextState {
  return useContext(WalletStateContext);
}

export function useWalletAdapterLoader(): WalletAdapterLoader {
  return useContext(WalletAdapterLoaderContext);
}
