import React from "react"
import { walletContext } from "./context"
import { useWallet } from "./useWallet"

interface WalletProviderProps {
  children: React.ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }: WalletProviderProps) => {
  const wallet = useWallet()

  return (
    <walletContext.Provider value={wallet}>
      {children}
    </walletContext.Provider>
  )
}