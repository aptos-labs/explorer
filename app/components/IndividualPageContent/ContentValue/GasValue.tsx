import React from "react";

type GasValueProps = {
  gas: string;
};

function formatWithThousandSeparator(value: string): string {
  const num = Number(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat().format(num);
}

export default function GasValue({gas}: GasValueProps) {
  return <span>{formatWithThousandSeparator(gas)} Gas Units</span>;
}
