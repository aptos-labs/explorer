import React from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {CoinData} from "../../Coin/Components/CoinData";

type TransactionsTabProps = {
  struct: string;
  data: CoinData | undefined;
};

export default function TransactionsTab({}: TransactionsTabProps) {
  // TODO: Lookup transactions by coin
  return <EmptyTabContent />;
}
