import * as React from "react";
import {Types} from "aptos";
import {Alert, Stack, Box} from "@mui/material";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";

type UnknownTabProps = {
  transaction: Types.Transaction;
};

export default function UnknownTab({transaction}: UnknownTabProps) {
  return (
    <Box marginTop={3}>
      <Stack direction="column" spacing={3}>
        <Alert severity="error">{`Unknown transaction type: "${transaction.type}"`}</Alert>
        <JsonCard data={transaction} />
      </Stack>
    </Box>
  );
}
