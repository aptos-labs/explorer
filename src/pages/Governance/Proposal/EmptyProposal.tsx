import React from "react";
import {Grid} from "@mui/material";

// TODO: generalize empty page for proposals, transactions, and more
export function EmptyProposal() {
  return (
    <Grid container marginTop={{md: 12, xs: 6}}>
      PROPOSAL NOT FOUND
    </Grid>
  );
}
