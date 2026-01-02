import {Stack, Typography} from "@mui/material";
import React from "react";
import {Types} from "aptos";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {TransactionType} from "../../components/TransactionType";
import {PageMetadata} from "../../components/hooks/usePageMetadata";

type TransactionTitleProps = {
  transaction: Types.Transaction;
};

export default function TransactionTitle({transaction}: TransactionTitleProps) {
  const version = "version" in transaction ? transaction.version : undefined;
  const shortHash = `${transaction.hash.slice(0, 10)}...${transaction.hash.slice(-8)}`;

  let title = `Transaction ${shortHash}`;
  if (version) {
    title = `Transaction #${version}`;
  }

  const description = `View Aptos transaction ${version ? `#${version}` : shortHash}. See transaction details, type (${transaction.type}), gas fees, events, and state changes.`;

  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <PageMetadata
        title={title}
        description={description}
        type="transaction"
        keywords={[
          "transaction",
          "tx",
          transaction.type,
          version ? `version ${version}` : "",
        ].filter(Boolean)}
        canonicalPath={version ? `/txn/${version}` : `/txn/${transaction.hash}`}
      />
      <Typography variant="h3">Transaction</Typography>
      <TitleHashButton hash={transaction.hash} type={HashType.TRANSACTION} />
      <TransactionType type={transaction.type} />
    </Stack>
  );
}
