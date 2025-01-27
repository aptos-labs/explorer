import React from "react";
import TransactionsTable from "../../Transactions/TransactionsTable";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {Block} from "@aptos-labs/ts-sdk";
import {Types} from "aptos";

type TransactionsTabProps = {
  data: Block;
};

export default function TransactionsTab({data}: TransactionsTabProps) {
  const transactions = data.transactions ?? [];
  if (transactions.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <TransactionsTable transactions={transactions as Types.Transaction[]} />
  );
}
