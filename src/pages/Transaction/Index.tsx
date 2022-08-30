import React from "react";
import {Stack, Grid, Alert} from "@mui/material";
import IndividualPageHeader from "../../components/IndividualPageHeader";
import {Types} from "aptos";
import {useGlobalState} from "../../GlobalState";
import {useParams} from "react-router-dom";
import {useQuery} from "react-query";
import {ResponseError} from "../../api/client";
import {getTransaction} from "../../api";
import Error from "./Error";
import TransactionTitle from "./Title/Index";
import TransactionTabs from "./Tabs";

export default function TransactionPage() {
  const [state, _] = useGlobalState();
  const {txnHashOrVersion} = useParams();

  if (typeof txnHashOrVersion !== "string") {
    return null;
  }

  const {isLoading, data, error} = useQuery<Types.Transaction, ResponseError>(
    ["transaction", {txnHashOrVersion}, state.network_value],
    () => getTransaction({txnHashOrVersion}, state.network_value),
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
    <Grid container spacing={1}>
      <IndividualPageHeader />
      <Grid item xs={12}>
        <Stack direction="column" spacing={4} marginTop={2}>
          <TransactionTitle transaction={data} />
          <TransactionTabs transaction={data} />
        </Stack>
      </Grid>
    </Grid>
  );
}
