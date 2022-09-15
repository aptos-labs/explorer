import React from "react";
import NumberFormat from "react-number-format";

type GasValueProps = {
  gas: string;
};

export default function GasValue({gas}: GasValueProps) {
  return <NumberFormat value={gas} displayType="text" thousandSeparator />;
}
