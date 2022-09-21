import React from "react";
import {getFormattedBalanceStr} from "../../Account/AccountInfo/Balance";
import MetricCard from "./MetricCard";

export default function TotalStake() {
  // TODO: get real data
  const totalStake = 1000000000000000;

  return (
    <MetricCard
      data={
        totalStake
          ? getFormattedBalanceStr(totalStake.toString(), undefined, 3)
          : "N/A"
      }
      label="Total Active Stake"
    />
  );
}
