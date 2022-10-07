import React from "react";
import {Types} from "aptos";
import TransactionsTable from "../../Transactions/TransactionsTable";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";

type TransactionsTabProps = {
  data: Types.Block;
};

export default function TransactionsTab({data}: TransactionsTabProps) {
  const transactions = data.transactions ?? [];
  if (transactions.length === 0) {
    return <EmptyTabContent />;
  }

  return <TransactionsTable transactions={transactions} />;
}
