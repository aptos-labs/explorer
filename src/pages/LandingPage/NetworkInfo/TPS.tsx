import React from "react";
import {useGetTPS} from "../../../api/hooks/useGetTPS";
import MetricCard from "./MetricCard";

export default function TPS() {
  const {tps} = useGetTPS();

  return (
    <MetricCard
      data={tps ? tps.toLocaleString("en-US") : "-"}
      label="Transactions per second (TPS)"
      tooltipText="Transactions per second (TPS) is the rate of verified transactions over the previous second, on a rolling basis."
    />
  );
}
