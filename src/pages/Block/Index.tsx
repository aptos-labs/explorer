import {useParams} from "react-router-dom";
import {Stack, Grid, Alert} from "@mui/material";
import React from "react";
import HeaderSearch from "../layout/Search/Index";
import BlockTitle from "./Title";
import BlockTabs from "./Tabs";
import {useGetBlockByHeight} from "../../api/hooks/useGetBlock";
import Error from "./Error";

export default function BlockPage() {
  const {height} = useParams();

  if (typeof height !== "string") {
    return null;
  }

  const {data, isLoading, error} = useGetBlockByHeight(parseInt(height));

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error error={error} height={height} />;
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
      <HeaderSearch />
      <Grid item xs={12}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <BlockTitle height={data.block_height} />
          <BlockTabs data={data} />
        </Stack>
      </Grid>
    </Grid>
  );
}
