import {Stack, Typography} from "@mui/material";
import React from "react";
import {PageMetadata} from "../../components/hooks/usePageMetadata";

export default function BlockTitle({height}: {height: number}) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <PageMetadata
        title={`Block ${height}`}
        description={`View details for Aptos block ${height}. See block timestamp, proposer, transactions included, and state changes.`}
      />
      <Typography variant="h3">Block</Typography>
    </Stack>
  );
}
