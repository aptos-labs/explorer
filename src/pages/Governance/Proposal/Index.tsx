import { Grid } from "@mui/material";
import React from "react";
import { ProposalHeader } from "./Header";
import { ProposalCard } from "./Card";
import { ProposalContent } from "./Content";
import { proposalsData } from "../dummyData";

export const ProposalPage = () => {

  // TODO: add error handling

  return (
    <Grid xs={12} marginTop={{ md: 12, xs: 6 }}>
      <Grid item sx={{ mb: 6 }}>
        <ProposalHeader />
      </Grid>
      <Grid item sx={{ mb: 6 }}>
        <ProposalCard />
      </Grid>
      <Grid item sx={{ mb: 6 }}>
        <ProposalContent proposalData={proposalsData[0]} />
      </Grid>
    </Grid >
  )
}