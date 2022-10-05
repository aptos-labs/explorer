import React from "react";
import {Alert} from "@mui/material";
import TransactionsTable from "../../Transactions/TransactionsTable";
import Error from "../Error";
import {useGetAccountTransactions} from "../../../api/hooks/useGetAccountTransactions";
import {useQuery} from "react-query";
import {Types} from "aptos";
import {ResponseError} from "../../../api/client";
import {useGlobalState} from "../../../GlobalState";
import {getAccount} from "../../../api";

type TransactionsTabProps = {
  address: string;
};

export default function TransactionsTab({address}: TransactionsTabProps) {
  const [state, _] = useGlobalState();

  const {data: accountData} = useQuery<Types.AccountData, ResponseError>(
    ["account", {address}, state.network_value],
    () => getAccount({address}, state.network_value),
  );

  const {isLoading, data, error} = useGetAccountTransactions(
    address,
    accountData?.sequence_number,
  );

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error address={address} error={error} />;
  }

  if (!data) {
    return (
      <Alert severity="error">
        {`Got an empty response fetching Account Transactions with address ${address}.`}
        <br />
        Try again later.
      </Alert>
    );
  }

  return (
    <TransactionsTable
      transactions={data}
      columns={["status", "timestamp", "version", "hash", "gas"]}
    />
  );
}
