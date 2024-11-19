import {Stack, Typography} from "@mui/material";
import React, {useEffect} from "react";

type BlockTitleProps = {
  name: string;
  tokenDataId: string;
};

export default function TokenTitle({name, tokenDataId}: BlockTitleProps) {
  useEffect(() => {
    document.title = `Aptos Explorer: Token ${name} (${tokenDataId})`;
  }, [name, tokenDataId]);
  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <Typography variant="h3">Token</Typography>
    </Stack>
  );
}
