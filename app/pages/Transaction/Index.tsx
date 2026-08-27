import {Alert, Grid, Skeleton, Stack, Typography} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import {toResponseError} from "../../api/client";
import {useGetTransaction} from "../../api/hooks/useGetTransaction";
import {isIndexerSourced} from "../../api/indexerTransaction";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {
  ContentRowsSkeleton,
  TabStripSkeleton,
} from "../../components/PageLoadSkeletons";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {truncateAddress} from "../../utils";
import {rewriteTxnTab} from "../../utils/routeRedirects";
import PageHeader from "../layout/PageHeader";
import TransactionError from "./Error";
import TransactionTabs from "./Tabs";
import TransactionTitle from "./Title";
import {getTransactionTabHeadLabel} from "./transactionTabMeta";

function TransactionPageSkeleton({
  urlTxnHashOrVersion,
  pathTab,
}: {
  urlTxnHashOrVersion: string;
  pathTab?: string;
}) {
  const tab = rewriteTxnTab(pathTab ?? "overview");
  const tabHead = getTransactionTabHeadLabel(tab);
  const displayId = truncateAddress(urlTxnHashOrVersion);

  return (
    <Stack
      direction="column"
      spacing={4}
      sx={{marginTop: 2}}
      aria-busy="true"
      aria-label="Loading transaction"
    >
      <Stack direction="column" spacing={2} sx={{marginX: 1}}>
        <PageMetadata
          title={`${tabHead} | Transaction ${displayId}`}
          description={`View ${tabHead.toLowerCase()} for transaction ${urlTxnHashOrVersion} on the Aptos blockchain.`}
          type="transaction"
          keywords={["transaction", "tx"]}
          canonicalPath={`/txn/${urlTxnHashOrVersion}/${tab}`}
        />
        <Typography variant="h3" component="h1">
          Transaction
        </Typography>
        {urlTxnHashOrVersion ? (
          <TitleHashButton
            hash={urlTxnHashOrVersion}
            type={HashType.TRANSACTION}
          />
        ) : (
          <Skeleton variant="rounded" width={220} height={36} />
        )}
        <Skeleton variant="rounded" width={140} height={28} />
      </Stack>
      <TabStripSkeleton />
      <ContentRowsSkeleton rows={10} />
    </Stack>
  );
}

export default function TransactionPage() {
  const params = useParams({strict: false}) as {
    txnHashOrVersion?: string;
    tab?: string;
  };
  const txnHashOrVersion = params?.txnHashOrVersion ?? "";

  const {isPending, data, error} = useGetTransaction(txnHashOrVersion);

  return (
    <Grid container>
      <PageHeader />
      <Grid size={{xs: 12}}>
        {error ? (
          <TransactionError
            error={toResponseError(error)}
            txnHashOrVersion={txnHashOrVersion}
          />
        ) : isPending ? (
          <TransactionPageSkeleton
            urlTxnHashOrVersion={txnHashOrVersion}
            pathTab={params.tab}
          />
        ) : !data ? (
          <Alert severity="error">
            Got an empty response fetching transaction with version or hash{" "}
            {txnHashOrVersion}
            <br />
            Try again later
          </Alert>
        ) : (
          <Stack
            direction="column"
            spacing={4}
            sx={{
              marginTop: 2,
            }}
          >
            {isIndexerSourced(data) && (
              <Alert severity="info">
                This transaction was reconstructed from indexer data because the
                fullnode has pruned it. Payload arguments, events, hashes, and
                some write-set changes may be missing. Balance changes still
                load from the indexer when available.
              </Alert>
            )}
            <TransactionTitle
              transaction={data}
              urlTxnHashOrVersion={txnHashOrVersion}
              pathTab={params.tab}
            />
            <TransactionTabs transaction={data} />
          </Stack>
        )}
      </Grid>
    </Grid>
  );
}
