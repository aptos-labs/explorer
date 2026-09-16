import type React from "react";
import {decimalSeparator, formatBigInt} from "../../../i18n/format";
import {DEFAULT_LOCALE} from "../../../i18n/locales";
import {useTranslation} from "../../../i18n";

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
  if (balance === "0") {
    return balance;
  }

  const resolvedDecimals = decimals ?? APTOS_DECIMALS;
  if (resolvedDecimals === 0) {
    return formatBigInt(BigInt(balance), locale);
  }

  const len = balance.length;
  const decimal = decimalSeparator(locale);

  if (len <= resolvedDecimals) {
    return `0${decimal}${trimRight("0".repeat(resolvedDecimals - len) + balance) || "0"}`;
  }

  const leftSide = formatBigInt(
    BigInt(balance.slice(0, len - resolvedDecimals)),
    locale,
  );
  let rightSide = balance.slice(len - resolvedDecimals);
  if (BigInt(rightSide) === BigInt(0)) {
    return leftSide;
  }

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

  return `${leftSide}${decimal}${trimRight(rightSide)}`;
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
