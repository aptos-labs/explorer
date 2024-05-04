import React from "react";
import {NumericFormat} from "react-number-format";

type GasValueProps = {
  gas: string;
};

export default function GasValue({gas}: GasValueProps) {
  return (
    <span>
      <NumericFormat value={gas} displayType="text" thousandSeparator /> Gas
      Units
    </span>
  );
}
