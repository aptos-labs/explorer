import React from "react";
import {useGetCoinSupplyLimit} from "../../../api/hooks/useGetCoinSupplyLimit";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import MetricCard from "./MetricCard";

export default function TotalSupply() {
  const totalSupply = useGetCoinSupplyLimit();

  return (
    <MetricCard
      data={
        totalSupply
          ? getFormattedBalanceStr(totalSupply.toString(), undefined, 0)
          : "-"
      }
      label="Total Supply"
      tooltip="Amount of MOVE tokens flowing through the Movement M1 network."
    />
  );
}
