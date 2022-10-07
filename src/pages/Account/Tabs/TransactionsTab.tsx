import React from "react";
import TransactionsTable from "../../Transactions/TransactionsTable";
import Error from "../Error";
import {useGetAccountTransactions} from "../../../api/hooks/useGetAccountTransactions";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";

type TransactionsTabProps = {
  address: string;
};

export default function TransactionsTab({address}: TransactionsTabProps) {
  const {isLoading, data, error} = useGetAccountTransactions(address);

  if (isLoading) {
    return null;
  }

  if (error) {
    return <Error address={address} error={error} />;
  }

  if (!data || data.length === 0) {
    return <EmptyTabContent />;
  }

  return <TransactionsTable transactions={data} />;
}
