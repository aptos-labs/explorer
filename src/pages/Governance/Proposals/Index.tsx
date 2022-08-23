import React, {useRef} from "react";
import {Grid, Hidden} from "@mui/material";

import {Header as ProposalsHeader} from "./Header";
import {ProposalsTable} from "./Table";
import {useGetProposalsTableData} from "../hooks/useGetProposalsTableData";
import {Instructions} from "./Instructions";
import {Header} from "../components/Header";

export function GovernancePage() {
  const data = useGetProposalsTableData();
  const ProposalsTableRef = useRef<null | HTMLDivElement>(null);

  const scrollTableIntoView = () => {
    ProposalsTableRef.current?.scrollIntoView({behavior: "smooth"});
  };

  if (!data) {
    // TODO: handle errors
    return <>No Data</>;
  }

  const {nextProposalId, handle} = data;

  return (
    <Grid item xs={12}>
      <Header />
      <ProposalsHeader onVoteProposalButtonClick={scrollTableIntoView} />
      <Hidden smDown>
        <Instructions onVoteProposalButtonClick={scrollTableIntoView} />
      </Hidden>
      <ProposalsTable
        nextProposalId={nextProposalId}
        handle={handle}
        ProposalsTableRef={ProposalsTableRef}
      />
    </Grid>
  );
}
