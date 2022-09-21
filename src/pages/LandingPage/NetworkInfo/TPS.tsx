import React from "react";
import MetricCard from "./MetricCard";

export default function TPS() {
  // TODO: get real data
  const tps = 10000;

  return (
    <MetricCard
      data={tps.toLocaleString("en-US")}
      label="TPS (transactions per sec)"
    />
  );
}
