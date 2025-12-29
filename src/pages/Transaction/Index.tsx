import {Stack, Grid, Alert} from "@mui/material";
import {Types} from "aptos";
import {
  useNetworkValue,
  useAptosClient,
} from "../../global-config/GlobalConfig";
import {useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../../api/client";
import {getTransaction} from "../../api";
import Error from "./Error";
import TransactionTitle from "./Title";
import TransactionTabs from "./Tabs";
import PageHeader from "../layout/PageHeader";

export default function TransactionPage() {
  const networkValue = useNetworkValue();
  const aptosClient = useAptosClient();
  const {txnHashOrVersion: txnParam} = useParams();
  const txnHashOrVersion = txnParam ?? "";

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
