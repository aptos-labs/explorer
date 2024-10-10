import {Stack, Typography} from "@mui/material";
import React from "react";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";

type CoinTitleProps = {
  struct: string;
};

export default function CoinTitle({struct}: CoinTitleProps) {
  function title() {
    return "Coin";
  }

  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <Typography variant="h3">{title()}</Typography>
      <Stack direction="row" spacing={1}>
        <TitleHashButton hash={struct} type={HashType.STRUCT} />
      </Stack>
    </Stack>
  );
}
