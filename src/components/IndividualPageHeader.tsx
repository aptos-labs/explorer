import React from "react";
import {Grid, Typography} from "@mui/material";
import DividerHero from "./DividerHero";
import HeaderSearch from "../pages/layout/Search";

export default function IndividualPageHeader() {
  return (
    <Grid item xs={12}>
      <Typography
        color="primary"
        variant="subtitle2"
        component="span"
        sx={{mb: 2}}
      >
        Network
      </Typography>
      <Typography variant="h3" component="h1" gutterBottom>
        Aptos Explorer
      </Typography>
      <DividerHero />
      <HeaderSearch />
    </Grid>
  );
}
