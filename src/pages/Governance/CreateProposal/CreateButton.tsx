import {Button, Grid} from "@mui/material";
import React from "react";
import {AptosClient, AptosAccount, FaucetClient, HexString, Types} from "aptos";

/* REQUIRED: Please replace the following with your own local network urls */
const NODE_URL = "http://127.0.0.1:8080";
const FAUCET_URL = "http://127.0.0.1:8081";

/* REQUIRED: Please replace the following with your own test account information */
const TEST_ACCOUNT_ADDRESS =
  "c1bc62cb0e142a8fcfdcd01ce2a9f5b01355fba73290768f62069fa6902e1585";
const TEST_ACCOUNT_SECRET_KEY =
  "0x894e620e2e96748118f448388ac4877bb3799be5233426e869a97e2ffcd91381";

/* OPTIONAL: Please replace the following with your own test data */
const TEST_EXCUTION_HASH =
  "0x21bd7a43e576297d3f71badd7ee740ccd2ef8a13cf6660075ae2de0994b1f433";
const TEST_METADATA_LOCATION =
  "https://mocki.io/v1/32403c87-d5d2-4136-80fd-d639a5d3d7dd";
const TEST_METADATA_HASH =
  "0x21ebf969b6f70c011dc607dab7ef5fc7447e9529061ec06ef83ce2afe4e5f675";

async function createProposal(account: AptosAccount, client: AptosClient) {
  const metadata_location = HexString.fromUint8Array(
    new TextEncoder().encode(TEST_METADATA_LOCATION),
  ).hex();
  const metadata_hash = HexString.fromUint8Array(
    new TextEncoder().encode(TEST_METADATA_HASH),
  ).hex();

  const payload: Types.TransactionPayload = {
    type: "script_function_payload",
    function: "0x1::aptos_governance::create_proposal",
    type_arguments: [],
    arguments: [
      account.address().hex(),
      TEST_EXCUTION_HASH,
      metadata_location,
      metadata_hash,
    ],
  };
  const transactionRes = await doTransaction(account, client, payload);
  console.log("proposal", transactionRes.hash);
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

async function increaseLockup(account: AptosAccount, client: AptosClient) {
  const currentTimestampSeconds = Math.floor(Date.now() / 1000);
  const secondsInTwoWeeks = currentTimestampSeconds + 60 * 60 * 24 * 14 - 1;

  const payload: Types.TransactionPayload = {
    type: "script_function_payload",
    function: "0x1::stake::increase_lockup",
    type_arguments: [],
    arguments: [`${secondsInTwoWeeks}`],
  };
  const transactionRes = await doTransaction(account, client, payload);
  console.log("lockup", transactionRes.hash);
}

export function CreateButton() {
  const onCreateProposalClick = async () => {
    const client = new AptosClient(NODE_URL);
    const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL, undefined);

    const address = HexString.ensure(TEST_ACCOUNT_ADDRESS);
    const secretKey = HexString.ensure(TEST_ACCOUNT_SECRET_KEY);

    const account = new AptosAccount(secretKey.toUint8Array(), address);
    await faucetClient.fundAccount(account.address(), 5000);

    await createProposal(account, client);
  };

  return (
    <Grid
      container
      direction="row"
      justifyContent={{xs: "center", sm: "flex"}}
      alignItems="center"
    >
      <Button variant="primary" sx={{mr: 2}} onClick={onCreateProposalClick}>
        Create a Test Proposal
      </Button>
    </Grid>
  );
}
