import {Types} from "aptos";
import React from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {CoinBalanceChangeTable} from "./Components/CoinBalanceChangeTable";
import {useTransactionBalanceChanges} from "../utils";

type BalanceChangeTabProps = {
  transaction: Types.Transaction;
};

export default function BalanceChangeTab({transaction}: BalanceChangeTabProps) {
  const {data: balanceChanges} = useTransactionBalanceChanges(
    "version" in transaction ? transaction.version : transaction.hash,
  );

  if (balanceChanges.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CoinBalanceChangeTable
      balanceChanges={balanceChanges}
      transaction={transaction as Types.UserTransaction}
    />
  );
}
