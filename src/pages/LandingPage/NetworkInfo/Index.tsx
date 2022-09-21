import React from "react";
import Grid from "@mui/material/Grid";
import TotalSupply from "./TotalSupply";
import TotalStake from "./TotalStake";
import TPS from "./TPS";
import ActiveValidators from "./ActiveValidators";

export default function NetworkInfo() {
  return (
    <Grid
      container
      spacing={3}
      direction="row"
      sx={{alignContent: "flex-start", mb: 6}}
    >
      <Grid item xs={12} md={6} lg={3}>
        <TotalSupply />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <TotalStake />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <TPS />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <ActiveValidators />
      </Grid>
    </Grid>
  );
}
