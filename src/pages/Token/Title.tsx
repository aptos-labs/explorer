import {Stack, Typography} from "@mui/material";
import React from "react";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";

type BlockTitleProps = {
  name: string;
  tokenDataId: string;
};

export default function TokenTitle({name, tokenDataId}: BlockTitleProps) {
  usePageMetadata({title: `Token ${name} (${tokenDataId})`});

  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <Typography variant="h3">Token</Typography>
    </Stack>
  );
}
