import {Stack, Typography} from "@mui/material";
import React from "react";
import {Types} from "aptos";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {TransactionType} from "../../components/TransactionType";
import {usePageMetadata} from "../../components/hooks/usePageMetadata";

type TransactionTitleProps = {
  transaction: Types.Transaction;
};

export default function TransactionTitle({transaction}: TransactionTitleProps) {
  let title = `Transaction ${transaction.hash}`;
  if ("version" in transaction) {
    title = ` Transaction ${transaction.version} (${transaction.hash})`;
  }

  usePageMetadata({title});
  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <Typography variant="h3">Transaction</Typography>
      <TitleHashButton hash={transaction.hash} type={HashType.TRANSACTION} />
      <TransactionType type={transaction.type} />
    </Stack>
  );
}
