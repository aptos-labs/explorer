import React, {useEffect} from "react";
import {Grid} from "@mui/material";

import {Header} from "./Header";
import {ProposalsTable} from "./Table";
import {useGetProposalsTableData} from "../hooks/useGetProposalsTableData";

export function GovernancePage() {
  const data = useGetProposalsTableData();

  if (!data) {
    // TODO: handle errors
    return <>No Data</>;
  }

  const {next_proposal_id: nextProposalId, handle} = data;

  return (
    <Grid item xs={12} marginTop={{md: 12, xs: 6}}>
      <Grid item sx={{mb: 8}}>
        <Header />
      </Grid>
      <Grid>
        <ProposalsTable nextProposalId={nextProposalId} handle={handle} />
      </Grid>
    </Grid>
  );
}
