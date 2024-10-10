import {Stack, Typography} from "@mui/material";
import React from "react";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";

type AssetTitleProps = {
  address: string;
};

export default function AssetTitle({address}: AssetTitleProps) {
  function title() {
    return "Fungible Asset";
  }

  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <Typography variant="h3">{title()}</Typography>
      <Stack direction="row" spacing={1}>
        <TitleHashButton hash={address} type={HashType.ACCOUNT} />
        <TitleHashButton hash={address} type={HashType.NAME} />
      </Stack>
    </Stack>
  );
}
