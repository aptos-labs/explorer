import React, { useEffect } from "react"
import { connectToWallet, getAccountAddress, getAptosWallet, isWalletConnected } from "../../api/wallet"

export function useWallet(){

  const [install, setInstall] = React.useState<any>(null)
  const [isConnected, setIsConnected] = React.useState<boolean>(false)
  const [accountAddress, setAccountAddres] = React.useState<string | null>(null)

  useEffect(() => {
    setInstall(getAptosWallet())
    isWalletConnected().then(setIsConnected)
  }, [])

  useEffect(() => {
    if (isConnected) {
      getAccountAddress().then((data) => setAccountAddres(data.address));
    }
  }, [isConnected])

  const connect = async () => {
    connectToWallet().then(setIsConnected)
  }

  return {install, isConnected, accountAddress, connect}
}