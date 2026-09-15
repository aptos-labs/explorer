import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import {Chip, Stack, Typography} from "@mui/material";
import type {Types} from "~/types/aptos";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {TransactionType} from "../../components/TransactionType";
import {useTranslation} from "../../i18n";
import {truncateAddress} from "../../utils";
import {rewriteTxnTab} from "../../utils/routeRedirects";
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
  pathTab = "overview",
}: TransactionTitleProps) {
  const {t} = useTranslation();
  const version = "version" in transaction ? transaction.version : undefined;
  const isMultisig = isMultisigTransaction(transaction);

  const titleLabel = isMultisig ? t("txn.multisigEntity") : t("txn.entity");
  const tab = rewriteTxnTab(pathTab);
  const tabHead = getTransactionTabHeadLabel(tab, t);
  const displayId = truncateAddress(urlTxnHashOrVersion);
  const metadataTitle = t("txn.metaTitle", {
    tab: tabHead,
    entity: titleLabel,
    id: displayId,
  });
  const metadataDescription = isMultisig
    ? t("txn.metaDescriptionMultisig", {
        tab: tabHead,
        id: urlTxnHashOrVersion,
      })
    : t("txn.metaDescription", {tab: tabHead, id: urlTxnHashOrVersion});

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
        canonicalPath={`/txn/${urlTxnHashOrVersion}/${tab}`}
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
            label={t("txn.multisigChip")}
            color="primary"
            variant="outlined"
            sx={{fontWeight: 600}}
          />
        )}
      </Stack>
      {transaction.hash ? (
        <TitleHashButton hash={transaction.hash} type={HashType.TRANSACTION} />
      ) : (
        <Typography variant="body2" sx={{color: "text.secondary"}}>
          {t("txn.hashUnavailable")}
        </Typography>
      )}
      <TransactionType type={transaction.type} />
    </Stack>
  );
}
