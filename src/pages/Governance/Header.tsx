import { Box, Grid, Link, Tooltip, Typography } from "@mui/material"
import React, { useEffect } from "react"
import PrimaryButton from "../../components/PrimaryButton"
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
        <Grid item xs={12} sm={12} md={8}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Aptos Governance
          </Typography>
          <Typography>
            Some instructions Some instructions Some instructions Some instructions Some instructions
          </Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={4} textAlign={{ sm: "left", md: "right" }}>
          {!wallet &&
            <Tooltip title={<Link href="https://aptos.dev/guides/building-wallet-extension" target="_blank">Please install the Aptos wallet</Link>}>
              <span>
                <PrimaryButton disabled={true}>Connect Wallet</PrimaryButton>
              </span>
            </Tooltip>
          }
          {wallet && !walletIsConnected && <PrimaryButton onClick={onConnectWalletClick}>Connect Wallet</PrimaryButton>}
          {walletIsConnected && <PrimaryButton disabled sx={{ overflow: "hidden", textOverflow: "ellipsis", width: '13rem' }}><Typography noWrap>{accountAddress}</Typography></PrimaryButton>}
        </Grid>
      </Grid>
    </Box>
  )
}
