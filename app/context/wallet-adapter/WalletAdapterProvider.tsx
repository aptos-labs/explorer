import React from "react";
import {AptosWalletAdapterProvider} from "@aptos-labs/wallet-adapter-react";
import {Network} from "@aptos-labs/ts-sdk";
import {useNetworkName} from "../../global-config";
import {hiddenNetworks} from "../../constants";

const AptosConnectId = "99d260d0-c69d-4c15-965f-f6f9b7b00102";

interface WalletAdapterProviderProps {
  children: React.ReactNode;
}

export function WalletAdapterProvider({children}: WalletAdapterProviderProps) {
  const networkNameFromState = useNetworkName();

  let networkName = networkNameFromState;
  if (hiddenNetworks.includes(networkName)) {
    // Other networks cause issues with the wallet adapter, so for now we can pretend it's local
    networkName = "local";
  }

  return (
    <AptosWalletAdapterProvider
      key={networkName}
      autoConnect={true}
      dappConfig={{
        aptosConnectDappId: AptosConnectId,
        network: networkName as Network,
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
