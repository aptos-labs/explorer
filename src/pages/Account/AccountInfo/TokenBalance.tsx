import React from "react";
import {Typography} from "@mui/material";

type TokenBalanceProps = {
  address: string;
};

// TODO: fetch balances data
export default function TokenBalance({address}: TokenBalanceProps) {
  return <Typography variant="body1">Token Balance: 17</Typography>;
}
