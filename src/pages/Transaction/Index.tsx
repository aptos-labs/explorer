import {Stack, Grid2, Alert} from "@mui/material";
import {useGlobalState} from "../../global-config/GlobalConfig";
import {useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {ResponseError} from "../../api/client";
import {getTransaction} from "../../api/v2";
import Error from "./Error";
import TransactionTitle from "./Title";
import TransactionTabs from "./Tabs";
import PageHeader from "../layout/PageHeader";
import {TransactionResponse} from "@aptos-labs/ts-sdk";

export default function TransactionPage() {
  const [state] = useGlobalState();
  const {txnHashOrVersion: txnParam} = useParams();
  const txnHashOrVersion = txnParam ?? "";

  const {isLoading, data, error} = useQuery<TransactionResponse, ResponseError>(
    {
      queryKey: ["transaction", {txnHashOrVersion}, state.network_value],
      queryFn: () => getTransaction({txnHashOrVersion}, state.sdk_v2_client),
    },
  );

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
    <Grid2 container>
      <PageHeader />
      <Grid2 size={{xs: 12}}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <TransactionTitle transaction={data} />
          <TransactionTabs transaction={data} />
        </Stack>
      </Grid2>
    </Grid2>
  );
}
