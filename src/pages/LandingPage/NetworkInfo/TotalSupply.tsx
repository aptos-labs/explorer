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
          ? getFormattedBalanceStr(totalSupply.toString(), undefined, 2)
          : "-"
      }
      label="Total Supply"
      tooltipText="Amount of APT tokens flowing through the Aptos network."
    />
  );
}
