import React from "react";
import {useGetTPS} from "../../../api/hooks/useGetTPS";
import MetricCard from "./MetricCard";

function getFormattedTPS(tps: number) {
  const tpsWithDecimal = parseFloat(tps.toFixed(0));
  return tpsWithDecimal.toLocaleString("en-US");
}

export default function TPS() {
  const {tps} = useGetTPS();

  return (
    <MetricCard
      data={tps ? getFormattedTPS(tps) : "-"}
      label="Transactions per second"
      tooltipText="Rate of verified transactions."
    />
  );
}
