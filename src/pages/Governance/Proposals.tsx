import React from "react";
import { Grid } from "@mui/material";

import { useGlobalState } from "../../GlobalState";
import { Header } from "./Header";
import { ProposalsTable } from "./ProposalsTable";

export function GovernancePage() {
  const [state, _] = useGlobalState();

  // TODO - FETCH ALL PROPOSALS

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sx={{ mt: 12 }}>
        <Header />
        <ProposalsTable />
      </Grid>
    </Grid>
  );
}