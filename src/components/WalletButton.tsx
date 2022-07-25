import React from "react";

import {Button, Link, Tooltip} from "@mui/material";
import {useWalletContext} from "../context/wallet/context";

export const WalletButton = (): JSX.Element => {
  const {isInstalled, isConnected, connect} = useWalletContext();

  return (
    <>
      {!isInstalled && (
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
      {isInstalled && !isConnected && (
        <Button variant="primary" onClick={connect}>
          Connect Wallet
        </Button>
      )}
    </>
  );
};
