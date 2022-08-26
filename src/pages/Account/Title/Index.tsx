import {Stack, Typography} from "@mui/material";
import React from "react";
import AddressButton from "./AddressButton";

type AccountTitleProps = {
  address: string;
};

export default function AccountTitle({address}: AccountTitleProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={2}>
      <Typography variant="h4" color="primary">
        Account:
      </Typography>
      <AddressButton address={address} />
    </Stack>
  );
}
