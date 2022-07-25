import {Grid} from "@mui/material";
import React from "react";
import {ProposalHeader} from "./Header";
import {ProposalCard} from "./Card";
import {ProposalContent} from "./Content";
import {proposalsData} from "../dummyData";
import useProvideProposalMetadata from "../ProvideProposalMetadata";

export const ProposalPage = () => {
  // TODO: add error handling

  const proposalData = proposalsData[0];
  const metadata = useProvideProposalMetadata(proposalData);

  return (
    <Grid container marginTop={{md: 12, xs: 6}}>
      <Grid xs={12} item>
        <ProposalHeader proposal={proposalData} metadata={metadata} />
      </Grid>
      <Grid xs={12} item sx={{mb: 6}}>
        <ProposalCard proposal={proposalData} />
      </Grid>
      <Grid item sx={{mb: 6}}>
        <ProposalContent proposal={proposalData} metadata={metadata} />
      </Grid>
    </Grid>
  );
};
