import * as React from "react";
import {Types} from "aptos";
import {Box, Typography} from "@mui/material";
import {renderDebug} from "../../utils";

type PayloadTabProps = {
  transaction: Types.Transaction;
};

export default function PayloadTab({transaction}: PayloadTabProps) {
  if (!("payload" in transaction)) {
    return <>None</>;
  }

  return (
    <Box marginX={2} marginTop={5}>
      <Typography
        variant="body1"
        marginBottom={3}
      >{`TYPE: ${transaction.payload.type}`}</Typography>
      {renderDebug(transaction.payload)}
    </Box>
  );
}
