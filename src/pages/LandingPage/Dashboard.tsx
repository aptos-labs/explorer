import React from "react";
import {TransactionsPreview} from "../Transactions/Transactions";
import LedgerInfo from "../LedgerInfo/LedgerInfo";
import Typography from "@mui/material/Typography";
import DividerHero from "../../components/Divider";
import HeadingSub from "../../components/HeadingSub";
import HeaderSearch from "../layout/Search";
import Box from "@mui/material/Box";

export default function Dashboard() {
  return (
    <Box>
      <HeadingSub>Network</HeadingSub>
      <Typography variant="h1" component="h1" gutterBottom>
        Aptos Explorer
      </Typography>
      <DividerHero />
      <LedgerInfo />
      <HeaderSearch />
      <TransactionsPreview />
    </Box>
  );
}
