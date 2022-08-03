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

  useEffect(() => {
    setAptosWallet(getAptosWallet());
    isWalletConnected().then(setIsConnected);
  }, []);

  useEffect(() => {
    window.aptos.on('accountChanged', (account: any) => {
      if (account.address) {
        setIsConnected(true);
        setAccountAddress(account.address);
      } else {
        setAccountAddress(null);
        setIsConnected(false);
      }
    });
  });

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
