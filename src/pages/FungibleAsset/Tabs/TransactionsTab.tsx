import React from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {FAData} from "../Components/FAData";

type TransactionsTabProps = {
  address: string;
  data: FAData | undefined;
};

export default function TransactionsTab({}: TransactionsTabProps) {
  // TODO: Lookup transactions by coin
  return <EmptyTabContent />;
}
