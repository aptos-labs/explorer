import React from "react";
import {useGetTPS} from "../../../api/hooks/useGetTPS";
import MetricCard from "./MetricCard";

export default function TPS() {
  const {tps} = useGetTPS();

  return (
    <MetricCard
      data={tps ? tps.toLocaleString("en-US") : "-"}
      label="TPS (transactions per sec)"
    />
  );
}
