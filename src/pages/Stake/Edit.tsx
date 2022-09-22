import React from "react";
import {Divider, Grid} from "@mui/material";
import {Types} from "aptos";
import {EditOperator} from "./components/EditOperator";
import {EditVoter} from "./components/EditVoter";
import {IncreaseLockup} from "./components/IncreaseLockup";

type EditProps = {
  stakePool: Types.MoveResource;
  isWalletConnected: boolean;
};

interface StakePoolData {
  operator_address: string;
  delegated_voter: string;
  locked_until_secs: string;
}

export function Edit({stakePool, isWalletConnected}: EditProps) {
  const {operator_address, delegated_voter, locked_until_secs} =
    stakePool.data as StakePoolData;

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={12}>
          <EditOperator
            operatorAddress={operator_address}
            isWalletConnected={isWalletConnected}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider variant="dotted" orientation="horizontal" />
        </Grid>
        <Grid item xs={12} sm={12}>
          <EditVoter
            delegatedVoter={delegated_voter}
            isWalletConnected={isWalletConnected}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider variant="dotted" orientation="horizontal" />
        </Grid>
        <Grid item xs={12} sm={12}>
          <IncreaseLockup
            lockedUntilSec={locked_until_secs}
            isWalletConnected={isWalletConnected}
          />
        </Grid>
      </Grid>
    </>
  );
}
