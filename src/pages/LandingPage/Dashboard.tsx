import React from "react";
import Grid from "@mui/material/Grid";
import {TransactionsPreview} from "../Transactions/Transactions";
import LedgerInfo from "../LedgerInfo/LedgerInfo";
import HeaderSearch from "../layout/Search";

export default function Dashboard() {
  return (
    <Grid container spacing={8}>
      <Grid item xs={12}>
        <HeaderSearch />
      </Grid>
      <Grid item xs={12}>
        <LedgerInfo />
      </Grid>
      <Grid item xs={12}>
        <TransactionsPreview />
      </Grid>
    </Grid>
  );
}
