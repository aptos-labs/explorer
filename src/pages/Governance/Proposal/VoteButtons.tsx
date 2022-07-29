import {Button, Grid, Tooltip} from "@mui/material";
import React from "react";
import {AptosClient, AptosAccount, HexString, Types} from "aptos";
import {useGlobalState} from "../../../GlobalState";
import {doTransaction} from "../../utils";

// TODO: replace the following hard code data with account info from the wallet connected
const TEST_ACCOUNT_ADDRESS =
  "c1bc62cb0e142a8fcfdcd01ce2a9f5b01355fba73290768f62069fa6902e1585";
const TEST_ACCOUNT_SECRET_KEY =
  "0x894e620e2e96748118f448388ac4877bb3799be5233426e869a97e2ffcd91381";

async function vote(
  networkValue: string,
  proposalId: string,
  shouldPass: boolean,
) {
  const client = new AptosClient(networkValue);
  const address = HexString.ensure(TEST_ACCOUNT_ADDRESS);
  const secretKey = HexString.ensure(TEST_ACCOUNT_SECRET_KEY);
  const account = new AptosAccount(secretKey.toUint8Array(), address);

  const payload: Types.TransactionPayload = {
    type: "script_function_payload",
    function: "0x1::aptos_governance::vote",
    type_arguments: [],
    arguments: [account.address().hex(), proposalId, shouldPass],
  };

  await doTransaction(account, client, payload);
}

type Props = {
  proposalId: string;
};

export function VoteButtons({proposalId}: Props) {
  const [state, _] = useGlobalState();

  const voted = false; // TODO - fetch real data

  const isEligibleToVote = (): boolean => {
    return true; // TODO - check if eligible to vote
  };

  const onVote = (shouldPass: boolean) => {
    vote(state.network_value, proposalId, shouldPass);
  };

  const onForVoteClick = () => {
    onVote(true);
  };

  const onAgainstVoteClick = () => {
    onVote(false);
  };

  if (voted) {
    return (
      <Button variant="primary" disabled>
        Voted Against
      </Button>
    );
  }

  return isEligibleToVote() ? (
    <Grid
      container
      direction="row"
      justifyContent={{xs: "center", sm: "flex-end"}}
      alignItems="center"
    >
      <Button variant="primary" sx={{mr: 2}} onClick={onForVoteClick}>
        For
      </Button>
      <Button variant="primary" onClick={onAgainstVoteClick}>
        Against
      </Button>
    </Grid>
  ) : (
    <Tooltip title="You need to have a minimum of 1,000,000 coins in order to vote">
      <span>
        <Button variant="primary" disabled>
          Vote
        </Button>
      </span>
    </Tooltip>
  );
}
