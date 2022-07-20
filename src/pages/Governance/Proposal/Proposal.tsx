import { Grid } from "@mui/material";
import React from "react";
import { ProposalHeader } from "./ProposalHeader";
import { ProposalCard } from "./ProposalCard";
import { ProposalContent } from "./ProposalContent";

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