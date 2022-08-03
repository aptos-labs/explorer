import React from "react";
import {Stack, Typography, Link} from "@mui/material";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

export default function ConnectWalletInfo() {
  return (
    <Stack height={213} justifyContent="center" alignItems="center">
      <ErrorOutlineOutlinedIcon color="primary" fontSize="large" />
      <Typography marginTop={1}>To vote on a proposal</Typography>
      <Link
        href="https://aptos.dev/guides/building-wallet-extension"
        target="_blank"
      >
        Connect your wallet
      </Link>
    </Stack>
  );
}
