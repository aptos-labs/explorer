import {Chip, Stack, Typography} from "@mui/material";
import type {Types} from "~/types/aptos";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {TransactionType} from "../../components/TransactionType";
import {useNetworkName} from "../../global-config/GlobalConfig";
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
  const networkName = useNetworkName();
  const isDecibel = networkName === "decibel";

  const tabHead = getTransactionTabHeadLabel(pathTab);
  const displayId = truncateAddress(urlTxnHashOrVersion);
  const metadataTitle = isDecibel
    ? `${tabHead} | Decibel Transaction ${displayId}`
    : `${tabHead} | Transaction ${displayId}`;
  const metadataDescription = isDecibel
    ? `View ${tabHead.toLowerCase()} for Decibel network transaction ${urlTxnHashOrVersion}.`
    : `View ${tabHead.toLowerCase()} for transaction ${urlTxnHashOrVersion} on the Aptos blockchain.`;

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
          ...(isDecibel ? ["decibel", "decibel network"] : []),
        ].filter(Boolean)}
        canonicalPath={`/txn/${urlTxnHashOrVersion}/${pathTab}`}
      />
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography variant="h3" component="h1">
          Transaction
        </Typography>
        {isDecibel && (
          <Chip
            label="Decibel Network"
            color="primary"
            size="small"
            sx={{fontWeight: 600}}
          />
        )}
      </Stack>
      <TitleHashButton hash={transaction.hash} type={HashType.TRANSACTION} />
      <TransactionType type={transaction.type} />
    </Stack>
  );
}
