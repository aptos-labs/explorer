import {Stack, Typography} from "@mui/material";
import React from "react";
import HashButtonCopyable from "../../components/HashButtonCopyable";

type AccountTitleProps = {
  address: string;
};

export default function AccountTitle({address}: AccountTitleProps) {
  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <Typography variant="h3">Account</Typography>
      <HashButtonCopyable hash={address} />
    </Stack>
  );
}
