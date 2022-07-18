import * as RRD from "react-router-dom";
import { Box, Button, Grid, Link, Tooltip, Typography } from "@mui/material"
import React, { useEffect } from "react"
import { getAptosWallet, isWalletConnected, connectToWallet, getAccountAddress } from '../../api/wallet'

export const Header = () => {

  const [wallet, setWallet] = React.useState<any>(null)
  const [walletIsConnected, setWalletIsConnected] = React.useState<boolean>(false)
  const [accountAddress, setAccountAddres] = React.useState<string>("")

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
          {walletIsConnected ?
            <Typography variant="h5" noWrap sx={{ mb: 2 }}>Hello <Link
              component={RRD.Link}
              to={`/account/${accountAddress}`}
              color="primary"
            >{accountAddress}</Link>
            </Typography> :
            <Typography variant="h5" sx={{ mb: 2 }}>Aptos Governance</Typography>}
          <Typography>
            Some instructions Some instructions Some instructions Some instructions Some instructions
          </Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={4} textAlign={{ sm: "left", md: "right" }}>
          {!wallet &&
            <Tooltip title={<Link href="https://aptos.dev/guides/building-wallet-extension" target="_blank">Please install the Aptos wallet</Link>}>
              <span>
                <Button variant="cta" disabled>Connect Wallet</Button>
              </span>
            </Tooltip>
          }
          {wallet && !walletIsConnected && <Button variant="cta" onClick={onConnectWalletClick}>Connect Wallet</Button>}
        </Grid>
      </Grid>
    </Box>
  )
}
