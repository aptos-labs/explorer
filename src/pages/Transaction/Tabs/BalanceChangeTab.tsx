import {Types} from "aptos";
import React from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {getCoinBalanceChanges} from "../utils";
import {CoinBalanceChangeTable} from "./Components/CoinBalanceChangeTable";

type BalanceChangeTabProps = {
  transaction: Types.Transaction;
};

export default function BalanceChangeTab({transaction}: BalanceChangeTabProps) {
  const balanceChanges = getCoinBalanceChanges(transaction);

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
