import {Box, Typography} from "@mui/material";
import * as React from "react";
import {useGlobalState} from "../../GlobalState";
import PageHeader from "../layout/PageHeader";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function ValidatorsPage() {
  const [state, _] = useGlobalState();

  return (
    <Box>
      <PageHeader />
      <Typography variant="h3" marginBottom={2}>
        Validator
      </Typography>
      <></>
    </Box>
  );
}
