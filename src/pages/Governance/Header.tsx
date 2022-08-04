import { Grid, Typography } from "@mui/material";
import React from "react";
import DividerHero from "../../components/DividerHero";
import HeadingSub from "../../components/HeadingSub";
import { WalletButton } from "../../components/WalletButton";

export function Header(){
  return (
    <>
    <Grid container alignItems="center">
        <Grid item xs={12} sm={6}>
          <HeadingSub>Network</HeadingSub>
          <Typography variant="h1" component="h1" gutterBottom>
            Aptos Governance
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} textAlign={{sm:"right"}}>
          <WalletButton/>
        </Grid>
      </Grid>
      <DividerHero />
      </>
  )
}