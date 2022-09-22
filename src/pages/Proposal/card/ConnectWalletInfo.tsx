import React from "react";
import {Stack, Typography, Link, Button} from "@mui/material";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import {useWalletContext} from "../../../context/wallet/context";
import {installWalletUrl} from "../../../constants";

export default function ConnectWalletInfo() {
  const {isInstalled, isConnected, connect} = useWalletContext();

  if (isConnected) {
    return null;
  }

  return (
    <Stack height={213} justifyContent="center" alignItems="center" spacing={1}>
      <ErrorOutlineOutlinedIcon color="primary" fontSize="large" />
      <Typography marginTop={1}>To vote on a proposal</Typography>
      {!isInstalled && (
        <Link href={installWalletUrl} target="_blank">
          Install your wallet
        </Link>
      )}
      {isInstalled && !isConnected && (
        <Link component={Button} onClick={connect}>
          Connect your wallet
        </Link>
      )}
    </Stack>
  );
}
