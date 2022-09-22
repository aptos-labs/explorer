import React, {useRef} from "react";
import {Grid, Hidden} from "@mui/material";
import Header from "../../components/Header";
import {Header as ProposalsHeader} from "./Header";
import {ProposalsTable} from "./Table";
import {Instructions} from "./Instructions";
import {useGetProposalsTableData} from "../../api/hooks/useGetProposalsTableData";

export default function LandingPage() {
  const proposalTableData = useGetProposalsTableData();
  const ProposalsTableRef = useRef<null | HTMLDivElement>(null);

  const scrollTableIntoView = () => {
    ProposalsTableRef.current?.scrollIntoView({behavior: "smooth"});
  };

  if (!proposalTableData) {
    // TODO: handle errors
    return <>No Data</>;
  }

  const {nextProposalId} = proposalTableData;

  return (
    <Grid item xs={12}>
      <Header />
      <ProposalsHeader onVoteProposalButtonClick={scrollTableIntoView} />
      <Hidden smDown>
        <Instructions onVoteProposalButtonClick={scrollTableIntoView} />
      </Hidden>
      <ProposalsTable
        nextProposalId={nextProposalId}
        ProposalsTableRef={ProposalsTableRef}
      />
    </Grid>
  );
}
