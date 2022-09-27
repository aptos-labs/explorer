import * as React from "react";
import {useGetValidatorSet} from "../../api/hooks/useGetValidatorSet";
import {ValidatorsTable} from "./Table";

export function ValidatorsPage() {
  const {activeValidators} = useGetValidatorSet();
  return <ValidatorsTable validators={activeValidators} />;
}
