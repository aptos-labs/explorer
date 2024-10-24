import {Stack, Typography} from "@mui/material";
import React from "react";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";

type FATitleProps = {
  address: string;
};

export default function FATitle({address}: FATitleProps) {
  function title() {
    return "FungibleAsset";
  }

  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <Typography variant="h3">{title()}</Typography>
      <Stack direction="row" spacing={1}>
        <TitleHashButton hash={address} type={HashType.STRUCT} />
      </Stack>
    </Stack>
  );
}
