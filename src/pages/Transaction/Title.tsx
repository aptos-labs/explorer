import {Stack, Typography} from "@mui/material";
import React from "react";
import {Types} from "aptos";
import HashButtonCopyable from "../../components/HashButtonCopyable";
import {TransactionType} from "../../components/TransactionType";

type TransactionTitleProps = {
  transaction: Types.Transaction;
};

export default function TransactionTitle({transaction}: TransactionTitleProps) {
  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <Typography variant="h3">Transaction</Typography>
      <HashButtonCopyable hash={transaction.hash} />
      <TransactionType type={transaction.type} />
    </Stack>
  );
}
