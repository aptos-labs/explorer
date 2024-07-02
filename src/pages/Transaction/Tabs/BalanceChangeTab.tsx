import React from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {getCoinBalanceChanges} from "../utils";
import {CoinBalanceChangeTable} from "./Components/CoinBalanceChangeTable";
import {TransactionResponse, UserTransactionResponse} from "@aptos-labs/ts-sdk";

type BalanceChangeTabProps = {
  transaction: TransactionResponse;
};

export default function BalanceChangeTab({transaction}: BalanceChangeTabProps) {
  const balanceChanges = getCoinBalanceChanges(transaction);

  if (balanceChanges.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CoinBalanceChangeTable
      balanceChanges={balanceChanges}
      transaction={transaction as UserTransactionResponse} // TODO: This is not always true, but the shape should be good enough
    />
  );
}
