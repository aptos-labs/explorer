import {Stack, Typography} from "@mui/material";
import React from "react";

type BlockTitleProps = {
  height: string;
};

export default function BlockTitle({height}: BlockTitleProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <Typography variant="h3">Block</Typography>
    </Stack>
  );
}
