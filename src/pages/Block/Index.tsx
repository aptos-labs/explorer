import {useParams} from "react-router-dom";
import {Stack, Grid} from "@mui/material";
import React from "react";
import HeaderSearch from "../layout/Search/Index";
import {BLOCK_DUMMY_DATA} from "./data";
import BlockTitle from "./Title";
import BlockTabs from "./Tabs";

export default function BlockPage() {
  const {height} = useParams();

  if (typeof height !== "string") {
    return null;
  }

  const data = BLOCK_DUMMY_DATA;

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
