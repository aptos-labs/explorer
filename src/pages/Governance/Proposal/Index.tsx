import { Grid } from "@mui/material";
import React from "react";
import { ProposalHeader } from "./Header";
import { ProposalCard } from "./Card";
import { ProposalContent } from "./Content";

export const ProposalPage = () => {
  return (
    <Grid container marginTop={{ md: 12, xs: 6 }}>
      <Grid xs={12} item>
        <ProposalHeader />
      </Grid>
      <Grid xs={12} item sx={{ mb: 6 }}>
        <ProposalCard />
      </Grid>
      <Grid xs={12} item sx={{ mb: 6 }}>
        <ProposalContent />
      </Grid>
    </Grid >
  )
}