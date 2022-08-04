import {useState, useEffect} from "react";
import {
  connectToWallet,
  getAccountAddress,
  getAptosWallet,
  isWalletConnected,
  signAndSubmitTransaction,
} from "../../api/wallet";
import {Types} from "aptos";

export function useWallet() {
  const [isInstalled, setAptosWallet] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);

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

  const processTransaction = async (
    transactionPayload: Types.TransactionPayload,
  ): Promise<boolean> => {
    return signAndSubmitTransaction(transactionPayload);
  };

  return {
    isInstalled,
    isConnected,
    accountAddress,
    connect,
    processTransaction,
  };
}
