import React from "react";

import {Button, Link, Tooltip} from "@mui/material";
import {useWalletContext} from "../context/wallet/context";

export const WalletButton = (): JSX.Element => {
  const {aptosWallet, isConnected, connect} = useWalletContext();

  return (
    <>
      {!aptosWallet && (
        <Tooltip
          title={
            <Link
              href="https://aptos.dev/guides/building-wallet-extension"
              target="_blank"
            >
              Please install the Aptos wallet
            </Link>
          }
        >
          <span>
            <Button variant="primary" disabled>
              Connect Wallet
            </Button>
          </span>
        </Tooltip>
      )}
      {aptosWallet && !isConnected && (
        <Button variant="primary" onClick={connect}>
          Connect Wallet
        </Button>
      )}
    </>
  );
};
