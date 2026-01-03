import {useParams} from "@tanstack/react-router";
import {Stack, Grid, Alert} from "@mui/material";
import React from "react";
import BlockTitle from "./Title";
import BlockTabs from "./Tabs";
import {useGetBlockByHeight} from "../../api/hooks/useGetBlock";
import Error from "./Error";
import PageHeader from "../layout/PageHeader";

export default function BlockPage() {
  const params = useParams({strict: false}) as {height?: string};
  const height = params?.height;
  const actualHeight = parseInt(height ?? "");

  const {data, isLoading, error} = useGetBlockByHeight({
    height: actualHeight,
  });

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error error={error} height={height ?? ""} />;
  }

  if (!data) {
    return (
      <Alert severity="error">
        Got an empty response fetching block with height {height}
        <br />
        Try again later
      </Alert>
    );
  }

  return (
    <Grid container spacing={1}>
      <PageHeader />
      <Grid size={{xs: 12}}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <BlockTitle height={actualHeight} />
          <BlockTabs data={data} />
        </Stack>
      </Grid>
    </Grid>
  );
}
