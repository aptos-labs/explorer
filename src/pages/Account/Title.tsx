import {Stack, Typography} from "@mui/material";
import React from "react";
import HashButtonCopyable from "../../components/HashButtonCopyable";

type AccountTitleProps = {
  address: string;
};

export default function AccountTitle({address}: AccountTitleProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={1}>
      <Typography variant="h5">Account:</Typography>
      <HashButtonCopyable hash={address} />
    </Stack>
  );
}
