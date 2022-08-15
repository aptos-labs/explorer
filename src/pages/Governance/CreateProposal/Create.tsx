import {Button, Grid, Typography, TextField} from "@mui/material";
import React, {useState} from "react";
import {AptosClient, AptosAccount, FaucetClient, HexString, Types} from "aptos";
import {getHexString} from "../../utils";
import {useGlobalState} from "../../../GlobalState";
import {doTransaction} from "../../utils";

/* REQUIRED: Please replace the following with your own local network urls */
const FAUCET_URL = "http://127.0.0.1:8000";

/* OPTIONAL: Please replace the following with your own test data */
const TEST_EXECUTION_HASH =
  "0x21bd7a43e576297d3f71badd7ee740ccd2ef8a13cf6660075ae2de0994b1f433";
const TEST_METADATA_LOCATION =
  "https://mocki.io/v1/5714369f-d2d6-4987-83a2-2f3f4c2b5d38";
const TEST_METADATA_HASH =
  "706b43a2a6f116099a079b2bf469a7add66190d26e324b275f174566d7e603ca";

async function createProposal(
  account: AptosAccount,
  client: AptosClient,
): Promise<string> {
  const payload: Types.TransactionPayload = {
    type: "script_function_payload",
    function: "0x1::aptos_governance::create_proposal",
    type_arguments: [],
    arguments: [
      account.address().hex(),
      TEST_EXECUTION_HASH,
      getHexString(TEST_METADATA_LOCATION),
      getHexString(TEST_METADATA_HASH),
    ],
  };
  const transactionRes = await doTransaction(account, client, payload);

  return transactionRes.hash;
}

export function Create() {
  const [state, _] = useGlobalState();

  const [accountAddr, setAccountAddr] = useState<string>("");
  const [accountSecretKey, setAccountSecretKey] = useState<string>("");

  const onAccountAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountAddr(event.target.value);
  };

  const onAccountSecretKeyChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setAccountSecretKey(event.target.value);
  };

  const onCreateProposalClick = async () => {
    const client = new AptosClient(state.network_value);
    const faucetClient = new FaucetClient(
      state.network_value,
      FAUCET_URL,
      undefined,
    );

    const address = HexString.ensure(accountAddr);
    const secretKey = HexString.ensure(accountSecretKey);

    const account = new AptosAccount(secretKey.toUint8Array(), address);
    await faucetClient.fundAccount(account.address(), 5000);

    const proposalHash = await createProposal(account, client);
    setProposalHash(proposalHash);
  };

  const [proposalHash, setProposalHash] = useState<string>();

  return (
    <>
      <TextField
        fullWidth
        label="Account Address"
        variant="outlined"
        margin="normal"
        value={accountAddr}
        onChange={onAccountAddrChange}
      />
      <TextField
        fullWidth
        label="Account Secret Key"
        variant="outlined"
        margin="normal"
        value={accountSecretKey}
        onChange={onAccountSecretKeyChange}
      />
      <Grid
        container
        direction="row"
        justifyContent={{xs: "center", sm: "flex"}}
        alignItems="center"
      >
        <Button variant="primary" sx={{mt: 4}} onClick={onCreateProposalClick}>
          Create a Test Proposal
        </Button>
      </Grid>
      {proposalHash && (
        <Grid
          container
          direction="row"
          justifyContent={{xs: "center", sm: "flex"}}
          alignItems="center"
        >
          <Typography mt={4}>New Proposal: {proposalHash}</Typography>
        </Grid>
      )}
    </>
  );
}
