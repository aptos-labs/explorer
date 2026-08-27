import {Alert, Grid, Stack} from "@mui/material";
import {useParams} from "@tanstack/react-router";
import {useGetTransaction} from "../../api/hooks/useGetTransaction";
import {isIndexerSourced} from "../../api/indexerTransaction";
import PageHeader from "../layout/PageHeader";
import TransactionError from "./Error";
import TransactionTabs from "./Tabs";
import TransactionTitle from "./Title";

export default function TransactionPage() {
  const params = useParams({strict: false}) as {
    txnHashOrVersion?: string;
    tab?: string;
  };
  const txnHashOrVersion = params?.txnHashOrVersion ?? "";

  const {isLoading, data, error} = useGetTransaction(txnHashOrVersion);

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <TransactionError error={error} txnHashOrVersion={txnHashOrVersion} />
    );
  }

  if (!data) {
    return (
      <Alert severity="error">
        Got an empty response fetching transaction with version or hash{" "}
        {txnHashOrVersion}
        <br />
        Try again later
      </Alert>
    );
  }

  return (
    <Grid container>
      <PageHeader />
      <Grid size={{xs: 12}}>
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
              some write-set changes may be missing. Balance changes still load
              from the indexer when available.
            </Alert>
          )}
          <TransactionTitle
            transaction={data}
            urlTxnHashOrVersion={txnHashOrVersion}
            pathTab={params.tab}
          />
          <TransactionTabs transaction={data} />
        </Stack>
      </Grid>
    </Grid>
  );
}
