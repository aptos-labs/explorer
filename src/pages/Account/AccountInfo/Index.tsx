import React from "react";
import {Stack, Typography, Box} from "@mui/material";
import Card from "../../../components/Card";

type AccountInfoProps = {
  address: string;
};

// TODO: fetch balances data
export default function AccountInfo({address}: AccountInfoProps) {
  const cardProps = {marginX: 2};

  return (
    <Box>
      <Card {...cardProps}>
        <Stack direction="column" spacing={2}>
          <Typography variant="subtitle1">APT Balance: 123456</Typography>
          <Typography variant="subtitle1">Token Balance: 17</Typography>
        </Stack>
      </Card>
    </Box>
  );
}
