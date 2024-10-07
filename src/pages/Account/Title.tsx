import {Stack, Typography} from "@mui/material";
import React from "react";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";

type AccountTitleProps = {
  address: string;
  isObject?: boolean;
  isDeleted?: boolean;
};

export default function AccountTitle({
  address,
  isObject = false,
  isDeleted = false,
}: AccountTitleProps) {
  function title() {
    if (isObject && isDeleted) {
      return "Deleted Object";
    }
    if (isObject) {
      return "Object";
    }
    return "Account";
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
