import React, {useEffect} from "react";
import {
  connectToWallet,
  getAccountAddress,
  getAptosWallet,
  isWalletConnected,
} from "../../api/wallet";

export function useWallet() {
  const [isInstalled, setAptosWallet] = React.useState<boolean>(false);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [accountAddress, setAccountAddress] = React.useState<string | null>(
    null,
  );
  const [isUpdatedVersion, setIsUpdatedVersion] =
    React.useState<boolean>(false);

  useEffect(() => {
    setAptosWallet(getAptosWallet());
    isWalletConnected().then(setIsConnected);
  }, []);

  useEffect(() => {
    // add this check to support older wallet versions
    if (window.aptos && window.aptos.on instanceof Function) {
      setIsUpdatedVersion(true);
      window.aptos.on("accountChanged", (account: any) => {
        if (account.address) {
          setIsConnected(true);
          setAccountAddress(account.address);
        } else {
          setAccountAddress(null);
          setIsConnected(false);
        }
      });
    } else {
      setIsUpdatedVersion(false);
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

  return {isInstalled, isConnected, accountAddress, isUpdatedVersion, connect};
}
