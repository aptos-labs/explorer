import {Stack, Typography} from "@mui/material";
import React, {useEffect} from "react";
import {Types} from "aptos";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {TransactionType} from "../../components/TransactionType";

type TransactionTitleProps = {
  transaction: Types.Transaction;
};

export default function TransactionTitle({transaction}: TransactionTitleProps) {
  useEffect(() => {
    if ("version" in transaction) {
      document.title = `Aptos Explorer: Transaction ${transaction.version} (${transaction.hash})`;
    } else {
      document.title = `Aptos Explorer: Transaction ${transaction.hash}`;
    }
  }, [transaction]);
  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <Typography variant="h3">Transaction</Typography>
      <TitleHashButton hash={transaction.hash} type={HashType.TRANSACTION} />
      <TransactionType type={transaction.type} />
    </Stack>
  );
}
