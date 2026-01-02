import {Stack, Typography} from "@mui/material";
import React from "react";
import {PageMetadata} from "../../components/hooks/usePageMetadata";

export default function BlockTitle({height}: {height: number}) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <PageMetadata
        title={`Block #${height.toLocaleString()}`}
        description={`View Aptos block #${height.toLocaleString()}. See block timestamp, proposer, epoch, round, transactions included, and state root hash.`}
        type="block"
        keywords={["block", "height", `block ${height}`, "proposer", "epoch"]}
        canonicalPath={`/block/${height}`}
      />
      <Typography variant="h3">Block</Typography>
    </Stack>
  );
}
