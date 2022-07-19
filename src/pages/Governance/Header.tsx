import React, { useEffect } from "react"
import { Box, Grid } from "@mui/material"

import { getAptosWallet, isWalletConnected, connectToWallet, getAccountAddress } from '../../api/wallet'
import { HeaderText } from "./HeaderText";
import { WalletButton } from "../../components/WalletButton";

export const Header = () => {

  const [wallet, setWallet] = React.useState<any>(null)
  const [walletIsConnected, setWalletIsConnected] = React.useState<boolean>(false)
  const [accountAddress, setAccountAddres] = React.useState<string | null>(null)

  useEffect(() => {
    setWallet(getAptosWallet())
    isWalletConnected().then(setWalletIsConnected)
  }, [])

  useEffect(() => {
    if (walletIsConnected) {
      getAccountAddress().then((data) => setAccountAddres(data.address));
    }
  }, [walletIsConnected])

  const onConnectWalletClick = async () => {
    connectToWallet().then(setWalletIsConnected)
  }

  return (
    <Box component="div" sx={{ p: 2, border: '1px solid gray', flexGrow: 1 }}>
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
  )
}
