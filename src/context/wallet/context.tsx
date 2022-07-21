import { createContext, useContext } from "react"

export interface walletContext {
  install: any; 
  isConnected: boolean; 
  accountAddress: string | null; 
  connect: () => Promise<void>;
}

export const walletContext = createContext<walletContext | null>(null)

export const useWalletContext = () => {

  const context = useContext(walletContext) as walletContext

  if (!context) {
    throw new Error('useColorMode must be used within a ColorModeContext')
  }
  return context
}