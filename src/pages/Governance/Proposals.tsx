import { Grid } from "@mui/material";
import React from "react";
import { useGlobalState } from "../../GlobalState";
import { Header } from "./Header";

export function GovernancePage() {
  const [state, _] = useGlobalState();

  // TODO - FETCH ALL PROPOSALS

  return (
    <Grid item xs={12} sx={{ mt: 12 }}>
      <Header />
    </Grid>
  );
}