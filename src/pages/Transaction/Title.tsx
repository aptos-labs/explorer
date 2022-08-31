import {Stack, Typography} from "@mui/material";
import React from "react";
import {Types} from "aptos";
import HashButtonCopyable from "../../components/HashButtonCopyable";
import {renderTransactionType} from "../Transactions/helpers";

type TransactionTitleProps = {
  transaction: Types.Transaction;
};

export default function TransactionTitle({transaction}: TransactionTitleProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} marginX={2}>
      <Typography variant="h4" color="primary">
        Transaction:
      </Typography>
      <HashButtonCopyable hash={transaction.hash} />
      {renderTransactionType(transaction.type)}
    </Stack>
  );
}
