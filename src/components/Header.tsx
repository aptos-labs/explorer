import {Grid, Typography, Hidden} from "@mui/material";
import React from "react";
import DividerHero from "./DividerHero";
import HeadingSub from "./HeadingSub";
import {WalletButton} from "./WalletButton";

export default function Header() {
  return (
    <>
      <Grid container alignItems="center">
        <Grid item xs={12} sm={6}>
          <HeadingSub>Network</HeadingSub>
          <Typography variant="h1" component="h1" gutterBottom>
            Aptos Governance
          </Typography>
        </Grid>
        <Hidden smDown>
          <Grid item xs={12} sm={6} textAlign={{sm: "right"}}>
            <WalletButton />
          </Grid>
        </Hidden>
      </Grid>
      <DividerHero />
    </>
  );
}
