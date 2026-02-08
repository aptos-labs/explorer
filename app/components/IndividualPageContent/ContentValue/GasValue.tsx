import React from "react";

type GasValueProps = {
  gas: string;
};

function formatWithThousandSeparator(value: string): string {
  // Use string-based formatting to avoid precision loss for large integers
  // (Number() loses precision above Number.MAX_SAFE_INTEGER)
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) {
    // Not a pure integer string - fall back to Number
    const num = Number(trimmed);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat().format(num);
  }
  // Insert thousand separators manually for integer strings
  const isNegative = trimmed.startsWith("-");
  const digits = isNegative ? trimmed.slice(1) : trimmed;
  const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return isNegative ? `-${formatted}` : formatted;
}

export default function GasValue({gas}: GasValueProps) {
  return <span>{formatWithThousandSeparator(gas)} Gas Units</span>;
}
