import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import {Chip, Stack, Typography} from "@mui/material";
import type {Types} from "~/types/aptos";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {TransactionType} from "../../components/TransactionType";
import {truncateAddress} from "../../utils";
import {getTransactionTabHeadLabel} from "./transactionTabMeta";
import {isMultisigTransaction} from "./utils";

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
  const isMultisig = isMultisigTransaction(transaction);

  const titleLabel = isMultisig ? "Multisig Transaction" : "Transaction";
  const tabHead = getTransactionTabHeadLabel(pathTab);
  const displayId = truncateAddress(urlTxnHashOrVersion);
  const metadataTitle = `${tabHead} | ${titleLabel} ${displayId}`;
  const metadataDescription = isMultisig
    ? `View ${tabHead.toLowerCase()} for multisig transaction ${urlTxnHashOrVersion} on the Aptos blockchain.`
    : `View ${tabHead.toLowerCase()} for transaction ${urlTxnHashOrVersion} on the Aptos blockchain.`;

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        marginX: 1,
      }}
    >
      <PageMetadata
        title={metadataTitle}
        description={metadataDescription}
        type="transaction"
        keywords={[
          "transaction",
          "tx",
          transaction.type,
          isMultisig ? "multisig" : "",
          isMultisig ? "multi-signature" : "",
          version ? `version ${version}` : "",
        ].filter(Boolean)}
        canonicalPath={`/txn/${urlTxnHashOrVersion}/${pathTab}`}
      />
      <Stack
        direction="row"
        spacing={1.5}
        sx={{alignItems: "center", flexWrap: "wrap"}}
      >
        <Typography variant="h3" component="h1">
          {titleLabel}
        </Typography>
        {isMultisig && (
          <Chip
            icon={<GroupsOutlinedIcon />}
            label="Multisig"
            color="primary"
            variant="outlined"
            sx={{fontWeight: 600}}
          />
        )}
      </Stack>
      <TitleHashButton hash={transaction.hash} type={HashType.TRANSACTION} />
      <TransactionType type={transaction.type} />
    </Stack>
  );
}
