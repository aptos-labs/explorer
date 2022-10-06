import React from "react";
import {Types} from "aptos";
import TransactionsTable from "../../Transactions/TransactionsTable";

type TransactionsTabProps = {
  data: Types.Block;
};

export default function TransactionsTab({data}: TransactionsTabProps) {
  return <TransactionsTable transactions={data.transactions ?? []} />;
}
