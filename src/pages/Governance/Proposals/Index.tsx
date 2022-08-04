import React, {useRef} from "react";
import {Grid, Hidden} from "@mui/material";

import {Header} from "./Header";
import {ProposalsTable} from "./Table";
import {useGetProposalsTableData} from "../hooks/useGetProposalsTableData";
import {Instructions} from "./Instructions";

export function GovernancePage() {
  const data = useGetProposalsTableData();
  const ProposalsTableRef = useRef<null | HTMLDivElement>(null);

  if (!data) {
    // TODO: handle errors
    return <>No Data</>;
  }

  const {nextProposalId, handle} = data;

  return (
    <Grid item xs={12} marginTop={{md: 12, xs: 6}}>
      <Header ProposalsTableRef={ProposalsTableRef} />
      <Hidden smDown>
        <Instructions ProposalsTableRef={ProposalsTableRef} />
      </Hidden>
      <ProposalsTable
        nextProposalId={nextProposalId}
        handle={handle}
        ProposalsTableRef={ProposalsTableRef}
      />
    </Grid>
  );
}
