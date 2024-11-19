import {Stack, Typography} from "@mui/material";
import React from "react";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";

export default function BlockTitle({height}: {height: number}) {
  usePageMetadata({title: `Block ${height}`});

  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <Typography variant="h3">Block</Typography>
    </Stack>
  );
}
