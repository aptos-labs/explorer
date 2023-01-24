import {Stack, Typography} from "@mui/material";
import React from "react";
import {Types} from "aptos";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";

type ValidatorTitleProps = {
  address: Types.Address;
};

export default function ValidatorTitle({address}: ValidatorTitleProps) {
  return (
    <Stack direction="column" spacing={4} marginX={1}>
      <Typography variant="h3">Validator</Typography>
      <Stack direction="row" spacing={1}>
        <TitleHashButton hash={address} type={HashType.ACCOUNT} />
      </Stack>
    </Stack>
  );
}
