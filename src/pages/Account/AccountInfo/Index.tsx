import React from "react";
import {Grid, Box} from "@mui/material";
import Card from "../../../components/Card";
import Balance from "./Balance";
import TokenBalance from "./TokenBalance";

type AccountInfoProps = {
  address: string;
};

export default function AccountInfo({address}: AccountInfoProps) {
  const cardProps = {marginX: 2};

  return (
    <Box>
      <Card {...cardProps}>
        <Grid container spacing={2}>
          <Grid item md={6} xs={12}>
            <Balance address={address} />
          </Grid>
          {/* TODO: show TokenBalance when development is done */}
          {/* <Grid item md={6} xs={12}>
            <TokenBalance address={address} />
          </Grid> */}
        </Grid>
      </Card>
    </Box>
  );
}
