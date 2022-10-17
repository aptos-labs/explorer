import {Stack, Typography, useTheme, useMediaQuery} from "@mui/material";
import React from "react";
import {Types} from "aptos";
import HashButtonCopyable from "../../components/HashButtonCopyable";
import {TransactionType} from "../../components/TransactionType";

type TransactionTitleProps = {
  transaction: Types.Transaction;
};

export default function TransactionTitle({transaction}: TransactionTitleProps) {
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Stack
      direction={{xs: "column"}}
      alignItems="flex-start"
      spacing={2}
      marginX={1}
      marginBottom={2}
    >
      {isOnMobile ? (
        <>
          <Stack direction="column" spacing={2}>
            <Typography variant="h3">Transaction</Typography>
            <HashButtonCopyable hash={transaction.hash} />
          </Stack>
          <TransactionType type={transaction.type} />
        </>
      ) : (
        <>
          <Typography variant="h3">Transaction</Typography>
          <Stack direction="column" alignItems="start" spacing={1}>
            <HashButtonCopyable hash={transaction.hash} />
            <TransactionType type={transaction.type} />
          </Stack>
        </>
      )}
    </Stack>
  );
}
