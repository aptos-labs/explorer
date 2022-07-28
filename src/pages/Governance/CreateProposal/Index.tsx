import React from "react";
import {Grid} from "@mui/material";
import {CreateButton} from "./CreateButton";

export function CreateProposalPage() {
  return (
    <Grid item xs={12} marginTop={{md: 12, xs: 6}}>
      {<CreateButton />}
    </Grid>
  );
}
