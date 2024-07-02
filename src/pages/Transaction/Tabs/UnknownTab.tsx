import * as React from "react";
import {Alert, Stack, Box} from "@mui/material";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {TransactionResponse} from "@aptos-labs/ts-sdk";

type UnknownTabProps = {
  transaction: TransactionResponse;
};

export default function UnknownTab({transaction}: UnknownTabProps) {
  return (
    <Box marginTop={3}>
      <Stack direction="column" spacing={3}>
        <Alert severity="error">{`Unknown transaction type: "${transaction.type}"`}</Alert>
        <JsonViewCard data={transaction} />
      </Stack>
    </Box>
  );
}
