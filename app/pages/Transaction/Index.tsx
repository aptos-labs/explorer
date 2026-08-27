import {Grid, Skeleton, Stack, Typography} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import {toResponseError} from "../../api/client";
import {useGetTransaction} from "../../api/hooks/useGetTransaction";
import {PageMetadata} from "../../components/hooks/usePageMetadata";
import {
  ContentRowsSkeleton,
  TabStripSkeleton,
} from "../../components/PageLoadSkeletons";
import TitleHashButton, {HashType} from "../../components/TitleHashButton";
import {truncateAddress} from "../../utils";
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
  const tabHead = getTransactionTabHeadLabel(pathTab);
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
          canonicalPath={`/txn/${urlTxnHashOrVersion}/${pathTab ?? "userTxnOverview"}`}
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
        ) : isPending || !data ? (
          <TransactionPageSkeleton
            urlTxnHashOrVersion={txnHashOrVersion}
            pathTab={params.tab}
          />
        ) : (
          <Stack
            direction="column"
            spacing={4}
            sx={{
              marginTop: 2,
            }}
          >
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
