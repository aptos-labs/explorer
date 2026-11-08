import type {WalletContextState} from "@aptos-labs/wallet-adapter-react";
import type React from "react";
import {lazy, Suspense, useCallback, useEffect, useMemo, useState} from "react";
import {useNetworkName} from "../../global-config";
import {
  disconnectedWalletState,
  WalletAdapterLoaderContext,
  WalletStateContext,
} from "./walletContext";

const LoadedWalletAdapter = lazy(() => import("./LoadedWalletAdapter"));

/** Key the adapter writes when a wallet connects (used for `autoConnect`). */
export const ADAPTER_WALLET_NAME_STORAGE_KEY = "AptosWalletName";

function hasRememberedWallet(): boolean {
  try {
    return window.localStorage.getItem(ADAPTER_WALLET_NAME_STORAGE_KEY) != null;
  } catch {
    return false;
  }
}

interface WalletAdapterProviderProps {
  children: React.ReactNode;
}

/**
 * Loads `@aptos-labs/wallet-adapter-react` only when a wallet is needed: when
 * something calls `useWalletAdapterLoader().load()` (the Connect Wallet button)
 * or right after hydration if a wallet was connected in a previous session, so
 * `autoConnect` still reconnects it. Until then `useWallet()` reports a
 * disconnected wallet.
 */
export function WalletAdapterProvider({children}: WalletAdapterProviderProps) {
  const networkName = useNetworkName();
  const [requested, setRequested] = useState(false);
  const [state, setState] = useState<WalletContextState>(
    disconnectedWalletState,
  );

  useEffect(() => {
    if (hasRememberedWallet()) setRequested(true);
  }, []);

  const load = useCallback(() => setRequested(true), []);
  const loader = useMemo(
    () => ({ready: state !== disconnectedWalletState, load}),
    [state, load],
  );

  return (
    <WalletAdapterLoaderContext.Provider value={loader}>
      <WalletStateContext.Provider value={state}>
        {children}
        {requested ? (
          <Suspense fallback={null}>
            <LoadedWalletAdapter
              networkName={networkName}
              onStateChange={setState}
            />
          </Suspense>
        ) : null}
      </WalletStateContext.Provider>
    </WalletAdapterLoaderContext.Provider>
  );
}
