import React from "react";
import { Grid } from "@mui/material";

import { useGlobalState } from "../../GlobalState";
import { Header } from "./Header";
import { ProposalsTable } from "./ProposalsTable";

export function GovernancePage() {
  const [state, _] = useGlobalState();

  // TODO - FETCH ALL PROPOSALS

  return (
    <Grid xs={12} marginTop={{ md: 12, xs: 6 }}>
      <Grid item sx={{ mb: 8 }}>
        <Header />
      </Grid>
      <Grid>
        <ProposalsTable />
      </Grid>
    </Grid >
  );
}