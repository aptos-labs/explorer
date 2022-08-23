import React from "react";
import {Grid} from "@mui/material";
import {Types} from "aptos";
import {EditOperator} from "./components/EditOperator";
import {EditVoter} from "./components/EditVoter";

type EditProps = {
  stakePool: Types.MoveResource;
  isWalletConnected: boolean;
};

interface StakePoolData {
  operator_address: string;
  delegated_voter: string;
}

export function Edit({stakePool, isWalletConnected}: EditProps) {
  const {operator_address, delegated_voter} = stakePool.data as StakePoolData;

  return (
    <Grid container>
      <Grid item xs={12}>
        <Grid
          container
          spacing={{xs: 6, sm: 12}}
          justifyContent="space-between"
          flexDirection="row"
        >
          <Grid item xs={12} sm={6}>
            <EditOperator
              operatorAddress={operator_address}
              isWalletConnected={isWalletConnected}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <EditVoter
              delegatedVoter={delegated_voter}
              isWalletConnected={isWalletConnected}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
