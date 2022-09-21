import React from "react";
import {TransactionsTable} from "../../../components/TransactionsTable";

type TransactionsTabProps = {
  // TODO: add graphql data typing
  data: any;
};

export default function TransactionsTab({data}: TransactionsTabProps) {
  return (
    <TransactionsTable
      transactions={[]}
      columns={["type", "status", "timestamp", "version", "hash", "gas"]}
    />
  );
}
