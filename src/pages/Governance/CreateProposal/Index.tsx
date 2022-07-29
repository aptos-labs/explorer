import React from "react";
import {Grid} from "@mui/material";
import {Create} from "./Create";

export function CreateProposalPage() {
  return (
    <Grid item xs={12} marginTop={{md: 12, xs: 6}}>
      {<Create />}
    </Grid>
  );
}
