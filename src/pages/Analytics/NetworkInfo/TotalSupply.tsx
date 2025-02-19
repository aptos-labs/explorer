import React from "react";
import {useGetCoinSupplyLimit} from "../../../api/hooks/useGetCoinSupplyLimit";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import MetricCard from "./MetricCard";
import {APTOS_COIN} from "@aptos-labs/ts-sdk";

export default function TotalSupply() {
  const {
    isLoading,
    data: [totalSupply],
  } = useGetCoinSupplyLimit(APTOS_COIN);

  return isLoading ? (
    <MetricCard
      data="Loading..."
      label="Total Supply"
      tooltip="Amount of APT tokens flowing through the Aptos network."
    />
  ) : (
    <MetricCard
      data={
        totalSupply
          ? getFormattedBalanceStr(totalSupply.toString(), undefined, 0)
          : "-"
      }
      label="Total Supply"
      tooltip="Amount of MOVE tokens flowing through the Movement network."
    />
  );
}
