import { Grid } from "@mui/material";
import React from "react";
import { ProposalHeader } from "./Header";
import { ProposalCard } from "./Card";
import { ProposalContent } from "./Content";

export const ProposalPage = () => {
  return (
    <Grid xs={12} marginTop={{ md: 12, xs: 6 }}>
      <Grid item sx={{ mb: 6 }}>
        <ProposalHeader />
      </Grid>
      <Grid item sx={{ mb: 6 }}>
        <ProposalCard />
      </Grid>
      <Grid item sx={{ mb: 6 }}>
        <ProposalContent />
      </Grid>
    </Grid >
  )
}