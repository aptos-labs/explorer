import {Types} from "aptos";
import React from "react";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {CoinBalanceChangeTable} from "./Components/CoinBalanceChangeTable";
import {
  BalanceChange,
  FungibleAssetActivity,
  useTransactionBalanceChanges,
} from "../utils";
import {
  CoinDescription,
  useGetCoinList,
} from "../../../api/hooks/useGetCoinList";
import {getAssetSymbol, tryStandardizeAddress} from "../../../utils";

type BalanceChangeTabProps = {
  transaction: Types.Transaction;
};

export default function BalanceChangeTab({transaction}: BalanceChangeTabProps) {
  const {data: coinData} = useGetCoinList();

  const {data: transactionChangesResponse} = useTransactionBalanceChanges(
    "version" in transaction ? transaction.version : transaction.hash,
  );

  function convertAddress(a: FungibleAssetActivity) {
    return a.type.includes("GasFeeEvent")
      ? (a.gas_fee_payer_address ?? a.owner_address)
      : a.owner_address;
  }

  function convertType(activity: FungibleAssetActivity) {
    if (activity.type.includes("GasFee")) {
      return "Gas Fee";
    }
    if (activity.type.includes("Withdraw")) {
      return "Withdraw";
    }
    if (activity.type.includes("Deposit")) {
      return "Deposit";
    }
    if (activity.type.includes("StorageRefund")) {
      return "Storage Refund";
    }

    return "Unknown";
  }

  function convertAmount(activity: FungibleAssetActivity) {
    if (activity.type.includes("GasFeeEvent")) {
      return -BigInt(activity.amount);
    }
    if (activity.type.includes("Withdraw")) {
      return BigInt(-activity.amount);
    }
    return BigInt(activity.amount);
  }

  const balanceChanges: BalanceChange[] =
    transactionChangesResponse?.fungible_asset_activities
      .filter((a) => a.amount !== null)
      .map((a) => {
        const entry = findCoinData(coinData?.data, a.asset_type);

        return {
          address: convertAddress(a),
          amount: convertAmount(a),
          type: convertType(a),
          asset: {
            decimals: a.metadata?.decimals,
            symbol: getAssetSymbol(
              entry?.panoraSymbol,
              entry?.bridge,
              a.metadata.symbol,
            ),
            type: a.type,
            id: entry?.tokenAddress ?? a.asset_type,
          },
          known: entry !== undefined,
          isInPanoraTokenList: entry?.isInPanoraTokenList,
          isBanned: entry?.isBanned,
          logoUrl: entry?.logoUrl,
          panoraSymbol: entry?.panoraSymbol,
        };
      }) ?? [];

  // Find gas fee and add a storage refund event
  const gasFeeEvent =
    transactionChangesResponse?.fungible_asset_activities.find((a) =>
      a.type.includes("GasFeeEvent"),
    );
  if (gasFeeEvent && (gasFeeEvent?.storage_refund_amount ?? 0) > 0) {
    balanceChanges.push({
      address: gasFeeEvent.gas_fee_payer_address ?? gasFeeEvent.owner_address,
      amount: BigInt(gasFeeEvent.storage_refund_amount),
      type: "Storage Refund",
      asset: {
        decimals: gasFeeEvent.metadata?.decimals,
        symbol: gasFeeEvent.metadata?.symbol,
        type: "v1",
        id: gasFeeEvent.asset_type,
      },
      known: true,
      isBanned: false,
      isInPanoraTokenList: true,
      logoUrl:
        "https://raw.githubusercontent.com/PanoraExchange/Aptos-Tokens/main/logos/APT.svg",
    });
  }

  if (balanceChanges.length === 0) {
    return <EmptyTabContent />;
  }

  return (
    <CoinBalanceChangeTable
      balanceChanges={balanceChanges}
      transaction={transaction as Types.UserTransaction}
    />
  );
}

export function findCoinData(
  coinData: CoinDescription[] | undefined,
  asset_type: string,
): CoinDescription | undefined {
  let entry: CoinDescription | undefined;
  if (coinData) {
    const coinType = asset_type.includes("::") ? asset_type : undefined;
    const faAddress = asset_type && tryStandardizeAddress(asset_type);
    entry = coinData.find((c) => {
      const isMatchingFa =
        faAddress &&
        c.faAddress &&
        tryStandardizeAddress(faAddress) === tryStandardizeAddress(c.faAddress);
      const isMatchingCoin =
        coinType && c.tokenAddress && c.tokenAddress === coinType;
      return isMatchingCoin || isMatchingFa;
    });
  }
  return entry;
}
