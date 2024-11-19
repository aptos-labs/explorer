import {Stack, Typography} from "@mui/material";
import React, {useEffect} from "react";

export default function BlockTitle({height}: {height: number}) {
  useEffect(() => {
    document.title = `Aptos Explorer: Block ${height}`;
  }, [height]);

  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <Typography variant="h3">Block</Typography>
    </Stack>
  );
}
