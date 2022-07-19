import React from "react"

import { Button, Link, Tooltip } from "@mui/material"

type WalletButtonProps = {
  wallet: any,
  walletIsConnected: boolean,
  onConnectWalletClick: () => Promise<void>
}

export const WalletButton = ({ wallet, walletIsConnected, onConnectWalletClick }: WalletButtonProps): JSX.Element => {
  return (
    <>
      {!wallet &&
        <Tooltip title={<Link href="https://aptos.dev/guides/building-wallet-extension" target="_blank">Please install the Aptos wallet</Link>}>
          <span>
            <Button variant="primary" disabled>Connect Wallet</Button>
          </span>
        </Tooltip>
      }
      {wallet && !walletIsConnected && <Button variant="primary" onClick={onConnectWalletClick}>Connect Wallet</Button>}
    </>
  )
}