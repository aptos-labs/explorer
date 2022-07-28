import {Button, Grid, Tooltip} from "@mui/material";
import React from "react";
import {AptosClient, AptosAccount, FaucetClient, HexString, Types} from "aptos";

const NODE_URL = "http://127.0.0.1:8080";
const FAUCET_URL = "http://127.0.0.1:8081";

async function submitVote(account: AptosAccount, client: AptosClient) {
  const proposalId = "1";
  const shouldPass = false;

  console.log(account.address().hex());
  console.log(account.address().hex());

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

async function vote() {
  const client = new AptosClient(NODE_URL);
  const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL, undefined);

  const address = HexString.ensure(
    "c1bc62cb0e142a8fcfdcd01ce2a9f5b01355fba73290768f62069fa6902e1585",
  );
  const pkey = HexString.ensure(
    "0x894e620e2e96748118f448388ac4877bb3799be5233426e869a97e2ffcd91381",
  );
  const account = new AptosAccount(pkey.toUint8Array(), address);

  // await faucetClient.fundAccount(account1.address(), 5000);

  await submitVote(account, client);
}

export function VoteButtons() {
  const voted = false; // TODO - fetch real data

  const isEligibleToVote = (): boolean => {
    return true; // TODO - check if eligible to vote
  };

  const onForVoteClick = () => {
    // TODO - implement for vote
    console.log("onForVoteClick");

    vote();
  };

  const onAgainstVoteClick = () => {
    // TODO - implement against vote
    console.log("onAgainstVoteClick");
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
