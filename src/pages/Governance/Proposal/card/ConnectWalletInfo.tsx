import React from "react";
import {Stack, Typography, Link} from "@mui/material";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import {useWalletContext} from "../../../../context/wallet/context";

export default function ConnectWalletInfo() {
  const {isInstalled, isConnected, connect} = useWalletContext();

  if (isConnected) {
    return null;
  }

  return (
    <Stack height={213} justifyContent="center" alignItems="center">
      <ErrorOutlineOutlinedIcon color="primary" fontSize="large" />
      <Typography marginTop={1}>To vote on a proposal</Typography>
      {!isInstalled && (
        <Link
          href="https://aptos.dev/guides/building-wallet-extension"
          target="_blank"
        >
          Install your wallet
        </Link>
      )}
      {isInstalled && !isConnected && (
        <Link onClick={connect}>Connect your wallet</Link>
      )}
    </Stack>
  );
}
