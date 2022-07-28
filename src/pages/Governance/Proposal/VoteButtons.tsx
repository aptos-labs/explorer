import {Button, Grid, Tooltip} from "@mui/material";
import React from "react";
import {AptosClient, AptosAccount, FaucetClient, HexString, Types} from "aptos";

/* REQUIRED: Please replace the following with your own local network urls */
const NODE_URL = "http://127.0.0.1:8080";

/* REQUIRED: Please replace the following with your own test account information */
const TEST_ACCOUNT_ADDRESS =
  "c1bc62cb0e142a8fcfdcd01ce2a9f5b01355fba73290768f62069fa6902e1585";
const TEST_ACCOUNT_SECRET_KEY =
  "0x894e620e2e96748118f448388ac4877bb3799be5233426e869a97e2ffcd91381";

async function submitVote(
  account: AptosAccount,
  client: AptosClient,
  proposalId: string,
  shouldPass: boolean,
) {
  const payload: Types.TransactionPayload = {
    type: "script_function_payload",
    function: "0x1::aptos_governance::vote",
    type_arguments: [],
    arguments: [account.address().hex(), proposalId, shouldPass],
  };

  const transactionRes = await doTransaction(account, client, payload);
  console.log("vote", transactionRes);
}

async function doTransaction(
  account: AptosAccount,
  client: AptosClient,
  payload: any,
) {
  const txnRequest = await client.generateTransaction(
    account.address(),
    payload,
  );
  const signedTxn = await client.signTransaction(account, txnRequest);
  const transactionRes = await client.submitTransaction(signedTxn);
  await client.waitForTransaction(transactionRes.hash);
  return transactionRes;
}

async function vote(proposalId: string, shouldPass: boolean) {
  const client = new AptosClient(NODE_URL);

  const address = HexString.ensure(TEST_ACCOUNT_ADDRESS);
  const secretKey = HexString.ensure(TEST_ACCOUNT_SECRET_KEY);
  const account = new AptosAccount(secretKey.toUint8Array(), address);

  await submitVote(account, client, proposalId, shouldPass);
}

type Props = {
  proposalId: string;
};

export function VoteButtons({proposalId}: Props) {
  const voted = false; // TODO - fetch real data

  const isEligibleToVote = (): boolean => {
    return true; // TODO - check if eligible to vote
  };

  const onForVoteClick = () => {
    vote(proposalId, true);
  };

  const onAgainstVoteClick = () => {
    vote(proposalId, false);
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
