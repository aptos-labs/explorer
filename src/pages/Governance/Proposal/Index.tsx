import {Grid} from "@mui/material";
import React from "react";
import {ProposalHeader} from "./Header";
import {ProposalCard} from "./card/Index";
import {ProposalContent} from "./Content";
import {useParams} from "react-router-dom";
import {useGetProposal} from "../hooks/useGetProposal";
import {EmptyProposal} from "./EmptyProposal";
import {Header} from "../components/Header";

export type ProposalPageURLParams = {
  id: string;
  handle: string;
};

export const ProposalPage = () => {
  // useParams type signature is string | undefined - to go around it we cast the return value
  const {id: proposalId, handle} = useParams() as ProposalPageURLParams;
  const proposal = useGetProposal(handle, proposalId);

  if (!proposal) {
    return <EmptyProposal />;
  }

  return (
    <Grid container>
      <Header />
      <Grid item md={12} xs={12} sx={{mb: 6}}>
        <ProposalHeader proposal={proposal} />
      </Grid>
      <Grid
        item
        md={8}
        xs={12}
        paddingRight={{md: 6, xs: 0}}
        marginBottom={{md: 0, xs: 6}}
      >
        <ProposalContent proposal={proposal} />
      </Grid>
      <Grid item md={4} xs={12}>
        <ProposalCard proposal={proposal} />
      </Grid>
    </Grid>
  );
};
