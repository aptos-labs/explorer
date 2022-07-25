import React, { useEffect } from "react"
import { Box, Grid } from "@mui/material"

import { getAptosWallet, isWalletConnected, connectToWallet, getAccountAddress } from '../../../api/wallet'
import { HeaderText } from "./HeaderText";
import { WalletButton } from "../../../components/WalletButton";

export const Header = () => {

  const [wallet, setWallet] = React.useState<any>(null)
  const [walletIsConnected, setWalletIsConnected] = React.useState<boolean>(false)
  const [accountAddress, setAccountAddress] = React.useState<string | null>(null)

  useEffect(() => {
    setWallet(getAptosWallet())
    isWalletConnected().then(setWalletIsConnected)
  }, [])

  useEffect(() => {
    if (walletIsConnected) {
      getAccountAddress().then(setAccountAddress);
    }
  }, [walletIsConnected])

  const onConnectWalletClick = async () => {
    connectToWallet().then(setWalletIsConnected)
  }

  return (
    <Box position="relative">
      <Box component="div" sx={{ top: "0.5rem", left: "-0.5rem", zIndex: "-10" }} height="100%" width="100%" position="absolute" borderRadius={1} border="1px solid gray">
      </Box>

      <Box component="div" sx={{ p: 2, flexGrow: 1, backgroundColor: "#151515" }} borderRadius={1} border="1px solid gray">
        <Grid container sx={{ p: 2 }} alignItems="center" spacing={4}>
          <Grid item xs={12} sm={12} md={8} sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            <HeaderText walletIsConnected={walletIsConnected} accountAddress={accountAddress} />
          </Grid>
          <Grid item xs={12} sm={12} md={4} textAlign={{ sm: "left", md: "right" }}>
            <WalletButton
              onConnectWalletClick={onConnectWalletClick}
              walletIsConnected={walletIsConnected}
              wallet={wallet}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
