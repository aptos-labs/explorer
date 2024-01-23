import React from "react";

const APTOS_DECIMALS = 8;

function trimRight(rightSide: string) {
  while (rightSide.endsWith("0")) {
    rightSide = rightSide.slice(0, -1);
  }
  return rightSide;
}

export function getFormattedBalanceStr(
  balance: string,
  decimals?: number,
  fixedDecimalPlaces?: number,
): string {
  // If balance is zero or decimals is 0, just return it
  if (balance == "0" || (decimals !== undefined && decimals === 0)) {
    return balance;
  }

  const len = balance.length;
  decimals = decimals || APTOS_DECIMALS;

  // If length is less than decimals, pad with 0s to decimals length and return
  if (len <= decimals) {
    return "0." + (trimRight("0".repeat(decimals - len) + balance) || "0");
  }

  // Otherwise, insert decimal point at len - decimals
  const leftSide = BigInt(balance.slice(0, len - decimals)).toLocaleString(
    "en-US",
  );
  let rightSide = balance.slice(len - decimals);
  if (BigInt(rightSide) == BigInt(0)) {
    return leftSide;
  }

  // remove trailing 0s
  rightSide = trimRight(rightSide);
  if (
    fixedDecimalPlaces !== undefined &&
    rightSide.length > fixedDecimalPlaces
  ) {
    rightSide = rightSide.slice(0, fixedDecimalPlaces - rightSide.length);
  }

  if (rightSide.length === 0 || rightSide === "0") {
    return leftSide;
  }

  return leftSide + "." + trimRight(rightSide);
}

type CurrencyValueProps = {
  amount: string;
  decimals?: number;
  fixedDecimalPlaces?: number;
  currencyCode?: string | React.ReactNode;
};

export default function CurrencyValue({
  amount,
  decimals,
  fixedDecimalPlaces,
  currencyCode,
}: CurrencyValueProps) {
  const number = getFormattedBalanceStr(amount, decimals, fixedDecimalPlaces);
  if (currencyCode) {
    return (
      <span>
        {number} {currencyCode}
      </span>
    );
  } else {
    return <span>{number}</span>;
  }
}

export function APTCurrencyValue({
  amount: amountStr,
  decimals,
  fixedDecimalPlaces,
}: CurrencyValueProps) {
  // remove leading "-" when it's a negative number
  let amount = amountStr;
  if (amountStr.startsWith("-")) {
    amount = amountStr.substring(1);
  }

  return (
    <CurrencyValue
      {...{amount, decimals, fixedDecimalPlaces}}
      currencyCode="MVMT"
    />
  );
}
