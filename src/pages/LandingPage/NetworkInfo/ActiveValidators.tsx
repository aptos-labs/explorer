import React from "react";
import {useGetValidatorSet} from "../../../api/hooks/useGetValidatorSet";
import MetricCard from "./MetricCard";

export default function ActiveValidators() {
  const {numberOfActiveValidators} = useGetValidatorSet();

  return (
    <MetricCard
      data={
        numberOfActiveValidators
          ? numberOfActiveValidators.toLocaleString("en-US")
          : "-"
      }
      label="Active Validators"
    />
  );
}
