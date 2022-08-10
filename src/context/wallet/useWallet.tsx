import {useState, useEffect} from "react";
import {
  connectToWallet,
  getAccountAddress,
  getAptosWallet,
  isUpdatedVersion,
  isAccountCreated,
  isWalletConnected,
} from "../../api/wallet";
import {walletNetworkMap} from "../../constants";

export function useWallet() {
  const [isInstalled, setAptosWallet] = useState<boolean>(false);
  const [isAccountSet, setIsAccountSet] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [walletNetwork, setWalletNetwork] = useState<string>("Devnet");

  useEffect(() => {
    setAptosWallet(getAptosWallet());
  }, []);

  useEffect(() => {
    isAccountCreated().then(setIsAccountSet);
    isWalletConnected().then(setIsConnected);
  }, [isInstalled, accountAddress, isAccountSet]);

  useEffect(() => {
    // add this check to support older wallet versions
    if (isUpdatedVersion()) {
      window.aptos?.on?.("accountChanged", (account: any) => {
        if (account.address) {
          setAccountAddress(account.address);
        } else {
          setAccountAddress(null);
          // this means an account was created but wallet is not connected yet
          setIsAccountSet(true);
        }
      });
      window.aptos?.on?.("networkChanged", (newNetwork: string) => {
        setWalletNetwork(walletNetworkMap[newNetwork]);
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

  return {
    isInstalled,
    isAccountSet,
    isConnected,
    accountAddress,
    walletNetwork,
    connect,
  };
}
