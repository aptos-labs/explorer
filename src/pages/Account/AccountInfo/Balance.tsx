import React from "react";
import {Typography} from "@mui/material";
import {useGetAccountResources} from "../../../api/hooks/useGetAccountResources";

const APTOS_DECIMALS = 8;

interface CoinStore {
  coin: {
    value: string;
  };
}

export function getFormattedBalanceStr(
  balance: string,
  decimals?: number,
  toFix?: number,
): string {
  // If it's zero, just return it
  if (balance == "0") {
    return balance;
  }

  const len = balance.length;
  decimals = decimals || APTOS_DECIMALS;

  // If length is less than decimals, pad with 0s to decimals length and return
  if (len <= decimals) {
    return "0." + "0".repeat(decimals - len) + balance;
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
  while (rightSide.endsWith("0")) {
    rightSide = rightSide.slice(0, -1);
  }

  if (toFix && rightSide.length > toFix) {
    rightSide = rightSide.slice(0, toFix - rightSide.length);

    // remove trailing 0s again
    while (rightSide.endsWith("0")) {
      rightSide = rightSide.slice(0, -1);
    }
  }

  return leftSide + "." + rightSide;
}

type BalanceProps = {
  address: string;
};

export default function Balance({address}: BalanceProps) {
  const {isLoading, data, error} = useGetAccountResources(address);

  if (isLoading || error || !data) {
    return null;
  }

  const coinStore = data.find(
    (resource) =>
      resource.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
  );

  if (!coinStore) {
    return null;
  }

  const coinStoreData: CoinStore = coinStore.data as CoinStore;
  const balance = coinStoreData?.coin?.value;

  return (
    <Typography variant="body1">
      {`Balance: ${getFormattedBalanceStr(balance)} APT`}
    </Typography>
  );
}
