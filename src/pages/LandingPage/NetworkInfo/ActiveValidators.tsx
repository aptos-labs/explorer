import React from "react";
import MetricCard from "./MetricCard";

export default function ActiveValidators() {
  // TODO: get real data
  const activeValidators = 700;

  return (
    <MetricCard
      data={activeValidators.toLocaleString("en-US")}
      label="Active Validators"
    />
  );
}
