import {useState, useEffect} from "react";
import {
  connectToWallet,
  getAccountAddress,
  getAptosWallet,
  isWalletConnected,
} from "../../api/wallet";

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

  return {
    isInstalled,
    isConnected,
    accountAddress,
    connect,
  };
}
