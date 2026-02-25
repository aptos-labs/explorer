import {Alert, Grid, Stack} from "@mui/material";
import {useQuery} from "@tanstack/react-query";
import {useParams} from "@tanstack/react-router";
import type {Types} from "~/types/aptos";
import {getTransaction} from "../../api";
import type {ResponseError} from "../../api/client";
import {
  useAptosClient,
  useNetworkValue,
} from "../../global-config/GlobalConfig";
import PageHeader from "../layout/PageHeader";
import Error from "./Error";
import TransactionTabs from "./Tabs";
import TransactionTitle from "./Title";

export default function TransactionPage() {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const params = useParams({strict: false}) as {txnHashOrVersion?: string};
  const txnHashOrVersion = params?.txnHashOrVersion ?? "";

  const {isLoading, data, error} = useQuery<Types.Transaction, ResponseError>({
    queryKey: ["transaction", {txnHashOrVersion}, networkValue],
    queryFn: () => getTransaction({txnHashOrVersion}, aptosClient),
  });

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error error={error} txnHashOrVersion={txnHashOrVersion} />;
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
        <Stack direction="column" spacing={4} marginTop={2}>
          <TransactionTitle transaction={data} />
          <TransactionTabs transaction={data} />
        </Stack>
      </Grid>
    </Grid>
  );
}
