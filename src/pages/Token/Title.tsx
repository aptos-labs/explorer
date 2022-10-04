import {Stack, Typography} from "@mui/material";
import React from "react";

type BlockTitleProps = {
  name: string;
};

export default function TokenTitle({name}: BlockTitleProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <Typography variant="h3">Token</Typography>
    </Stack>
  );
}
