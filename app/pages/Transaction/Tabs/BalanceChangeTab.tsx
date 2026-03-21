import {Network} from "@aptos-labs/ts-sdk";
import {
  Button,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import type {Types} from "~/types/aptos";
import {useGetCoinList} from "../../../api/hooks/useGetCoinList";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {
  VerifiedType,
  verifiedLevel,
} from "../../../components/Table/VerifiedCell";
import {useNetworkName} from "../../../global-config/GlobalConfig";
import {getAssetSymbol} from "../../../utils";
import {
  type BalanceChange,
  type FungibleAssetActivity,
  findCoinData,
  parseRawEventsForBalanceChanges,
  useTransactionBalanceChanges,
} from "../utils";
import {CoinBalanceChangeTable} from "./Components/CoinBalanceChangeTable";

type BalanceChangeTabProps = {
  transaction: Types.Transaction;
};

enum BalanceViewType {
  NON_AGGREGATED,
  AGGREGATED,
}

enum VerificationFilterType {
  VERIFIED,
  RECOGNIZED,
  ALL,
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
      const existing = balanceMap.get(key);
      if (existing) {
        existing.totalAmount += change.amount;
      }
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
  const networkName = useNetworkName();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const {data: coinData} = useGetCoinList();
  const [viewType, setViewType] = React.useState(
    BalanceViewType.NON_AGGREGATED,
  );
  const [verificationFilter, setVerificationFilter] = React.useState(
    networkName === Network.MAINNET
      ? VerificationFilterType.VERIFIED
      : VerificationFilterType.ALL,
  );

  const {data: transactionChangesResponse} = useTransactionBalanceChanges(
    "version" in transaction ? transaction.version : transaction.hash,
  );

  const convertAddress = React.useCallback((a: FungibleAssetActivity) => {
    return a.type.includes("GasFeeEvent")
      ? (a.gas_fee_payer_address ?? a.owner_address)
      : a.owner_address;
  }, []);

  const convertType = React.useCallback((activity: FungibleAssetActivity) => {
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
    if (activity.type.includes("Transfer")) {
      return "Transfer";
    }
    if (activity.type.includes("Mint")) {
      return "Mint";
    }
    if (activity.type.includes("Burn")) {
      return "Burn";
    }
    if (activity.type.includes("Frozen")) {
      return "Frozen";
    }

    return "Unknown";
  }, []);

  const convertAmount = React.useCallback((activity: FungibleAssetActivity) => {
    if (activity.type.includes("GasFeeEvent")) {
      return -BigInt(activity.amount);
    }
    if (activity.type.includes("Withdraw")) {
      return BigInt(-activity.amount);
    }
    if (activity.type.includes("Burn")) {
      return BigInt(-activity.amount);
    }
    // Deposit, Mint, Transfer - positive amounts
    return BigInt(activity.amount);
  }, []);

  const balanceChanges: BalanceChange[] = React.useMemo(() => {
    const indexerActivities =
      transactionChangesResponse?.fungible_asset_activities ?? [];

    // If indexer has activities, use them
    if (indexerActivities.length > 0) {
      const changes: BalanceChange[] = indexerActivities
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
        });

      // Find gas fee and add a storage refund event
      const gasFeeEvent = indexerActivities.find((a) =>
        a.type.includes("GasFeeEvent"),
      );
      if (gasFeeEvent && (gasFeeEvent?.storage_refund_amount ?? 0) > 0) {
        changes.push({
          address:
            gasFeeEvent.gas_fee_payer_address ?? gasFeeEvent.owner_address,
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

      return changes;
    }

    // Fallback: Parse raw transaction events when indexer has no activities
    return parseRawEventsForBalanceChanges(transaction, coinData?.data);
  }, [
    transactionChangesResponse,
    coinData,
    convertAddress,
    convertType,
    convertAmount,
    transaction,
  ]);

  // Filter balance changes by verification status (for mobile)
  const filteredBalanceChanges = React.useMemo(() => {
    if (verificationFilter === VerificationFilterType.ALL) {
      return balanceChanges;
    }

    return balanceChanges.filter((change) => {
      const level = verifiedLevel(
        {
          id: change.asset.id,
          known: change.known,
          isBanned: change.isBanned,
          isInPanoraTokenList: change.isInPanoraTokenList,
          symbol: change.asset.symbol,
        },
        networkName,
      ).level;

      if (verificationFilter === VerificationFilterType.VERIFIED) {
        return (
          level === VerifiedType.LABS_VERIFIED ||
          level === VerifiedType.COMMUNITY_VERIFIED ||
          level === VerifiedType.NATIVE_TOKEN
        );
      }

      // RECOGNIZED filter
      return (
        level === VerifiedType.LABS_VERIFIED ||
        level === VerifiedType.COMMUNITY_VERIFIED ||
        level === VerifiedType.NATIVE_TOKEN ||
        level === VerifiedType.RECOGNIZED
      );
    });
  }, [balanceChanges, verificationFilter, networkName]);

  if (balanceChanges.length === 0) {
    return <EmptyTabContent />;
  }

  const selectedTextColor = theme.palette.primary.main;
  const unselectedTextColor = theme.palette.text.secondary;
  const dividerTextColor =
    theme.palette.mode === "dark"
      ? theme.palette.neutralShade.lighter
      : theme.palette.neutralShade.darker;

  const verificationSelector = (
    <Stack
      direction="row"
      justifyContent="flex-end"
      spacing={1}
      marginY={0.5}
      height={16}
    >
      <Button
        variant="text"
        onClick={() => setVerificationFilter(VerificationFilterType.VERIFIED)}
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color:
            VerificationFilterType.VERIFIED === verificationFilter
              ? selectedTextColor
              : unselectedTextColor,
          padding: 0,
          "&:hover": {
            background: "transparent",
          },
        }}
      >
        Verified
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
        onClick={() => setVerificationFilter(VerificationFilterType.RECOGNIZED)}
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color:
            VerificationFilterType.RECOGNIZED === verificationFilter
              ? selectedTextColor
              : unselectedTextColor,
          padding: 0,
          "&:hover": {
            background: "transparent",
          },
        }}
      >
        Recognized
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
        onClick={() => setVerificationFilter(VerificationFilterType.ALL)}
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color:
            VerificationFilterType.ALL === verificationFilter
              ? selectedTextColor
              : unselectedTextColor,
          padding: 0,
          "&:hover": {
            background: "transparent",
          },
        }}
      >
        All
      </Button>
    </Stack>
  );

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

  // Use filtered changes on mobile, all changes on desktop
  const displayedBalanceChanges = isMobile
    ? filteredBalanceChanges
    : balanceChanges;

  return (
    <>
      <Stack
        direction={isMobile ? "column" : "row"}
        justifyContent={isMobile ? "flex-start" : "space-between"}
        alignItems={isMobile ? "stretch" : "center"}
        spacing={isMobile ? 1 : 0}
        sx={{mb: isMobile ? 1 : 0}}
      >
        {isMobile && networkName === Network.MAINNET && verificationSelector}
        {viewSelector}
      </Stack>
      {displayedBalanceChanges.length === 0 ? (
        <EmptyTabContent />
      ) : viewType === BalanceViewType.NON_AGGREGATED ? (
        <CoinBalanceChangeTable
          balanceChanges={displayedBalanceChanges}
          transaction={transaction as Types.UserTransaction}
        />
      ) : (
        <AggregatedBalanceTable
          balanceChanges={displayedBalanceChanges}
          transaction={transaction as Types.UserTransaction}
        />
      )}
    </>
  );
}
