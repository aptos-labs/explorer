import React, {useRef} from "react";
import {Grid, Hidden} from "@mui/material";

import {Header as ProposalsHeader} from "./Header";
import {ProposalsTable} from "./Table";
import {useGetProposalsTableData} from "../hooks/useGetProposalsTableData";
import {Instructions} from "./Instructions";
import {Header} from "../components/Header";

export function GovernancePage() {
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
