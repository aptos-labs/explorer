import type {Network} from "@aptos-labs/ts-sdk";
import {
  AptosWalletAdapterProvider,
  useWallet as useAdapterWallet,
  type WalletContextState,
} from "@aptos-labs/wallet-adapter-react";
import {memo, useEffect} from "react";
import {hiddenNetworks} from "../../constants";

const AptosConnectId = "99d260d0-c69d-4c15-965f-f6f9b7b00102";

type StateListener = (state: WalletContextState) => void;

function WalletStateBridge({onStateChange}: {onStateChange: StateListener}) {
  const state = useAdapterWallet();
  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);
  return null;
}

/**
 * Mounts the real wallet adapter beside (not around) the app tree, so loading
 * it never remounts page content. Its state is mirrored into
 * `WalletStateContext` by `WalletStateBridge`.
 */
function LoadedWalletAdapter({
  networkName,
  onStateChange,
}: {
  networkName: string;
  onStateChange: StateListener;
}) {
  // Other networks cause issues with the wallet adapter, so for now we can pretend it's local
  const adapterNetwork = hiddenNetworks.includes(networkName)
    ? "local"
    : networkName;

  return (
    <AptosWalletAdapterProvider
      key={adapterNetwork}
      autoConnect={true}
      dappConfig={{
        aptosConnectDappId: AptosConnectId,
        network: adapterNetwork as Network,
      }}
    >
      <WalletStateBridge onStateChange={onStateChange} />
    </AptosWalletAdapterProvider>
  );
}

export default memo(LoadedWalletAdapter);
