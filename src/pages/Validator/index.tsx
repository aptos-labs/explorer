import {Grid} from "@mui/material";
import * as React from "react";
import {useParams} from "react-router-dom";
import PageHeader from "../layout/PageHeader";
import ValidatorTitle from "./Title";
import ValidatorDetailCard from "./DetailCard";

export default function ValidatorPage() {
  const address = useParams().address ?? "";

  return (
    <Grid spacing={1}>
      <Grid item xs={12} md={12} lg={12}>
        <PageHeader />
      </Grid>
      <ValidatorTitle address={address} />
      <ValidatorDetailCard address={address} />
    </Grid>
  );
}
