import {Grid} from "@mui/material";
import React from "react";
import {ProposalHeader} from "./Header";
import {ProposalCard} from "./Card";
import {ProposalContent} from "./Content";
import {useParams} from "react-router-dom";
import { useGetProposal } from "../hooks/useGetProposal";

export type ProposalPageURLParams = {
  id: string;
  handle: string;
};

export const ProposalPage = () => {
  // useParams type signature is string | undefined - to go around it we cast the return value
  const {id: proposalId, handle} = useParams() as ProposalPageURLParams;
  const proposal = useGetProposal(handle, proposalId)
  
  if (!proposal) {
    return (
      <Grid container marginTop={{md: 12, xs: 6}}>
        PROPOSAL NOT FOUND
      </Grid>
    );
  }

  return (
    <Grid container marginTop={{md: 12, xs: 6}}>
      <Grid xs={12} item>
        <ProposalHeader proposal={proposal} />
      </Grid>
      <Grid xs={12} item sx={{mb: 6}}>
        <ProposalCard proposal={proposal} />
      </Grid>
      <Grid item sx={{mb: 6}}>
        <ProposalContent proposal={proposal} />
      </Grid>
    </Grid>
  );
};
