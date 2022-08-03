import React, {useEffect} from "react";
import {
  connectToWallet,
  getAccountAddress,
  getAptosWallet,
  isWalletConnected,
  signAndSubmitTransaction,
} from "../../api/wallet";
import {Types} from "aptos";

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
    if (isConnected) {
      getAccountAddress().then(setAccountAddress);
    }
  }, [isConnected]);

  const connect = async () => {
    connectToWallet().then(setIsConnected);
  };

  const processTransaction = async (transactionPayload: Types.TransactionPayload) => {
    signAndSubmitTransaction(transactionPayload);
  }

  return {isInstalled, isConnected, accountAddress, connect, processTransaction};
}
