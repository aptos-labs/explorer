import {Stack, Typography} from "@mui/material";
import type {Types} from "~/types/aptos";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {TransactionType} from "../../components/TransactionType";
import {truncateAddress} from "../../utils";
import {getTransactionTabHeadLabel} from "./transactionTabMeta";

type TransactionTitleProps = {
  transaction: Types.Transaction;
  /** Raw `txnHashOrVersion` path param (preserves URL form for canonical) */
  urlTxnHashOrVersion: string;
  /** Tab segment from `/txn/:id/:tab` */
  pathTab?: string;
};

export default function TransactionTitle({
  transaction,
  urlTxnHashOrVersion,
  pathTab = "userTxnOverview",
}: TransactionTitleProps) {
  const version = "version" in transaction ? transaction.version : undefined;

  const tabHead = getTransactionTabHeadLabel(pathTab);
  const displayId = truncateAddress(urlTxnHashOrVersion);
  const metadataTitle = `${tabHead} | Transaction ${displayId}`;
  const metadataDescription = `View ${tabHead.toLowerCase()} for transaction ${urlTxnHashOrVersion} on the Aptos blockchain.`;

  return (
    <Stack direction="column" spacing={2} marginX={1}>
      <PageMetadata
        title={metadataTitle}
        description={metadataDescription}
        type="transaction"
        keywords={[
          "transaction",
          "tx",
          transaction.type,
          version ? `version ${version}` : "",
        ].filter(Boolean)}
        canonicalPath={`/txn/${urlTxnHashOrVersion}/${pathTab}`}
      />
      <Typography variant="h3" component="h1">
        Transaction
      </Typography>
      <TitleHashButton hash={transaction.hash} type={HashType.TRANSACTION} />
      <TransactionType type={transaction.type} />
    </Stack>
  );
}
