import React from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {FACombinedData} from "../Index";

type TransactionsTabProps = {
  address: string;
  data: FACombinedData | undefined;
};

export default function TransactionsTab({}: TransactionsTabProps) {
  // TODO: Lookup transactions by coin
  return <EmptyTabContent />;
}
