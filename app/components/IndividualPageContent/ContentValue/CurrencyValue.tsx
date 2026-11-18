import type React from "react";
import {useTranslation} from "../../../i18n";
import {decimalSeparator, formatBigInt} from "../../../i18n/format";
import {DEFAULT_LOCALE} from "../../../i18n/locales";

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
  locale: string = DEFAULT_LOCALE,
): string {
  const trimmed = balance.trim();
  if (trimmed === "0" || trimmed === "-0") {
    return "0";
  }

  let sign = "";
  let magnitude = trimmed;
  if (magnitude.startsWith("-")) {
    sign = "-";
    magnitude = magnitude.slice(1);
  }
  if (magnitude === "" || !/^\d+$/.test(magnitude)) {
    return balance;
  }

  const resolvedDecimals = decimals ?? APTOS_DECIMALS;
  if (resolvedDecimals === 0) {
    return `${sign}${formatBigInt(BigInt(magnitude), locale)}`;
  }

  const len = magnitude.length;
  const decimal = decimalSeparator(locale);

  if (len <= resolvedDecimals) {
    return `${sign}0${decimal}${trimRight("0".repeat(resolvedDecimals - len) + magnitude) || "0"}`;
  }

  const leftSide = formatBigInt(
    BigInt(magnitude.slice(0, len - resolvedDecimals)),
    locale,
  );
  let rightSide = magnitude.slice(len - resolvedDecimals);
  if (BigInt(rightSide) === BigInt(0)) {
    return `${sign}${leftSide}`;
  }

  rightSide = trimRight(rightSide);
  if (
    fixedDecimalPlaces !== undefined &&
    rightSide.length > fixedDecimalPlaces
  ) {
    rightSide = rightSide.slice(0, fixedDecimalPlaces - rightSide.length);
  }

  if (rightSide.length === 0 || rightSide === "0") {
    return `${sign}${leftSide}`;
  }

  return `${sign}${leftSide}${decimal}${trimRight(rightSide)}`;
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
  const {locale} = useTranslation();
  const number = getFormattedBalanceStr(
    amount,
    decimals,
    fixedDecimalPlaces,
    locale,
  );
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
  let amount = amountStr;
  if (amountStr.startsWith("-")) {
    amount = amountStr.substring(1);
  }

  return (
    <CurrencyValue
      {...{amount, decimals, fixedDecimalPlaces}}
      currencyCode="APT"
    />
  );
}
