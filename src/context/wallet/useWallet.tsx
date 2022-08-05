import React, {useEffect} from "react";
import {
  connectToWallet,
  getAccountAddress,
  getAptosWallet,
  isUpdatedVersion,
  isWalletConnected,
} from "../../api/wallet";

export function useWallet() {
  const [isInstalled, setAptosWallet] = React.useState<boolean>(false);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [accountAddress, setAccountAddress] = React.useState<string | null>(
    null,
  );

  useEffect(() => {
    setAptosWallet(getAptosWallet());
  }, []);

  useEffect(() => {
    isWalletConnected().then(setIsConnected);
  }, [isInstalled, accountAddress]);

  useEffect(() => {
    // add this check to support older wallet versions
    if (isUpdatedVersion()) {
      window.aptos.on("accountChanged", (account: any) => {
        if (account.address) {
          setAccountAddress(account.address);
        } else {
          setAccountAddress(null);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      getAccountAddress().then(setAccountAddress);
    }
  }, [isConnected]);

  const connect = async () => {
    connectToWallet().then(setIsConnected);
  };

  return {isInstalled, isConnected, accountAddress, connect};
}
