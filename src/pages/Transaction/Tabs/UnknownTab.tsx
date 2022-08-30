import * as React from "react";
import {Types} from "aptos";
import {Alert, Stack, Box} from "@mui/material";
import {renderDebug} from "../../utils";

type UnknownTabProps = {
  transaction: Types.Transaction;
};

export default function UnknownTab({transaction}: UnknownTabProps) {
  return (
    <Box marginX={2} marginTop={5}>
      <Stack direction="column" spacing={3}>
        <Alert severity="error">{`Unknown transaction type: "${transaction.type}"`}</Alert>
        {renderDebug(transaction)}
      </Stack>
    </Box>
  );
}
