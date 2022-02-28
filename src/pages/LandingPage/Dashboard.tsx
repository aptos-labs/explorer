import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import {TransactionsPreview} from "../Transactions/Transactions";
import LedgerInfo from "../LedgerInfo/LedgerInfo";

export default function Dashboard() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <LedgerInfo/>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{p: 2, display: "flex", flexDirection: "column"}}>
          <TransactionsPreview/>
        </Paper>
      </Grid>
    </Grid>
  );
}
