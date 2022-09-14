import {Stack, Typography, useTheme, useMediaQuery} from "@mui/material";
import React from "react";
import {Types} from "aptos";
import HashButtonCopyable from "../../components/HashButtonCopyable";
import TransactionType from "../../components/TransactionType";
import {useGetInDevMode} from "../../api/hooks/useGetInDevMode";
import {renderTransactionType} from "../Transactions/helpers";

type TransactionTitleProps = {
  transaction: Types.Transaction;
};

export default function TransactionTitle({transaction}: TransactionTitleProps) {
  const inDev = useGetInDevMode();
  const theme = useTheme();
  const isOnMobile = !useMediaQuery(theme.breakpoints.up("md"));

  return inDev ? (
    <Stack
      direction={{xs: "column", md: "row"}}
      alignItems="flex-start"
      spacing={2}
      marginX={1}
      marginBottom={2}
    >
      {isOnMobile ? (
        <>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h5">Transaction:</Typography>
            <HashButtonCopyable hash={transaction.hash} />
          </Stack>
          <TransactionType type={transaction.type} />
        </>
      ) : (
        <>
          <Typography variant="h5">Transaction:</Typography>
          <Stack direction="column" alignItems="start" spacing={1}>
            <HashButtonCopyable hash={transaction.hash} />
            <TransactionType type={transaction.type} />
          </Stack>
        </>
      )}
    </Stack>
  ) : (
    <Stack
      direction={{xs: "column", md: "row"}}
      alignItems={{xs: "flex-start", md: "center"}}
      spacing={2}
      marginX={1}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h5">Transaction:</Typography>
        <HashButtonCopyable hash={transaction.hash} />
      </Stack>
      {renderTransactionType(transaction.type)}
    </Stack>
  );
}
