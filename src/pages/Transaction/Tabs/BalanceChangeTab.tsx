import {Types} from "aptos";
import React from "react";
import {Button, Stack, Typography} from "@mui/material";
import {useTheme} from "@mui/material";
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

enum BalanceViewType {
  NON_AGGREGATED,
  AGGREGATED,
}

type AggregatedBalance = {
  address: string;
  asset: BalanceChange["asset"];
  totalAmount: bigint;
  known: boolean;
  isInPanoraTokenList?: boolean;
  isBanned?: boolean;
  logoUrl?: string;
};

function aggregateBalanceChanges(
  changes: BalanceChange[],
): AggregatedBalance[] {
  const balanceMap = new Map<string, AggregatedBalance>();

  changes.forEach((change) => {
    const key = `${change.address}-${change.asset.id}`;

    if (balanceMap.has(key)) {
      const existing = balanceMap.get(key)!;
      existing.totalAmount += change.amount;
    } else {
      balanceMap.set(key, {
        address: change.address,
        asset: change.asset,
        totalAmount: change.amount,
        known: change.known,
        isInPanoraTokenList: change.isInPanoraTokenList,
        isBanned: change.isBanned,
        logoUrl: change.logoUrl,
      });
    }
  });

  return Array.from(balanceMap.values())
    .filter((entry) => entry.totalAmount !== BigInt(0))
    .sort((a, b) => {
      // First sort by address
      const addressCompare = a.address.localeCompare(b.address);
      if (addressCompare !== 0) return addressCompare;

      // Then by asset id
      return a.asset.id.localeCompare(b.asset.id);
    });
}

function AggregatedBalanceTable({
  balanceChanges,
  transaction,
}: {
  balanceChanges: BalanceChange[];
  transaction: Types.UserTransaction;
}) {
  const aggregatedChanges = aggregateBalanceChanges(balanceChanges);
  return (
    <CoinBalanceChangeTable
      balanceChanges={aggregatedChanges.map(({...agg}) => ({
        ...agg,
        amount: agg.totalAmount,
        type: "Net Change",
      }))}
      transaction={transaction}
    />
  );
}

export default function BalanceChangeTab({transaction}: BalanceChangeTabProps) {
  const theme = useTheme();
  const {data: coinData} = useGetCoinList();
  const [viewType, setViewType] = React.useState(
    BalanceViewType.NON_AGGREGATED,
  );

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
              a.metadata?.symbol,
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
      logoUrl: "https://assets.panora.exchange/tokens/aptos/APT.svg",
    });
  }

  if (balanceChanges.length === 0) {
    return <EmptyTabContent />;
  }

  const selectedTextColor = theme.palette.primary.main;
  const unselectedTextColor = theme.palette.text.secondary;
  const dividerTextColor =
    theme.palette.mode === "dark"
      ? theme.palette.neutralShade.lighter
      : theme.palette.neutralShade.darker;

  const viewSelector = (
    <Stack
      direction="row"
      justifyContent="flex-end"
      spacing={1}
      marginY={0.5}
      height={16}
    >
      <Button
        variant="text"
        onClick={() => setViewType(BalanceViewType.NON_AGGREGATED)}
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color:
            BalanceViewType.NON_AGGREGATED === viewType
              ? selectedTextColor
              : unselectedTextColor,
          padding: 0,
          "&:hover": {
            background: "transparent",
          },
        }}
      >
        Non-aggregated
      </Button>
      <Typography
        variant="subtitle1"
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: dividerTextColor,
        }}
      >
        |
      </Typography>
      <Button
        variant="text"
        onClick={() => setViewType(BalanceViewType.AGGREGATED)}
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color:
            BalanceViewType.AGGREGATED === viewType
              ? selectedTextColor
              : unselectedTextColor,
          padding: 0,
          "&:hover": {
            background: "transparent",
          },
        }}
      >
        Aggregated
      </Button>
    </Stack>
  );

  return (
    <>
      {viewSelector}
      {viewType === BalanceViewType.NON_AGGREGATED ? (
        <CoinBalanceChangeTable
          balanceChanges={balanceChanges}
          transaction={transaction as Types.UserTransaction}
        />
      ) : (
        <AggregatedBalanceTable
          balanceChanges={balanceChanges}
          transaction={transaction as Types.UserTransaction}
        />
      )}
    </>
  );
}

export function findCoinData(
  coinData: CoinDescription[] | undefined,
  asset_type: string,
): CoinDescription | undefined {
  if (!asset_type) {
    return undefined;
  }
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
