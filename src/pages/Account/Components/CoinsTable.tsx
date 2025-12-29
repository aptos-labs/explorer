import * as React from "react";
import {useMemo, useCallback} from "react";
import {
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import HashButton, {HashType} from "../../../components/HashButton";
import {grey, primary} from "../../../themes/colors/aptosColorPalette";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import VirtualizedTableBody from "../../../components/Table/VirtualizedTableBody";
import ResponsiveTableContainer from "../../../components/Table/ResponsiveTableContainer";
import {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {
  VerifiedCoinCell,
  verifiedLevel,
  VerifiedType,
} from "../../../components/Table/VerifiedCell";
import {getAssetSymbol} from "../../../utils";
import {getLearnMoreTooltip} from "../../Transaction/helpers";
import {useNetworkName} from "../../../global-config/GlobalConfig";
import {Network} from "@aptos-labs/ts-sdk";
import {useGetInMainnet} from "../../../api/hooks/useGetInMainnet";

const CoinNameCell = React.memo(function CoinNameCell({name}: {name: string}) {
  return (
    <GeneralTableCell
      sx={{
        textAlign: "left",
        maxWidth: 300,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {name}
    </GeneralTableCell>
  );
});

const AmountCell = React.memo(function AmountCell({
  amount,
  decimals,
  symbol,
}: {
  amount: number | null | undefined;
  decimals: number | null | undefined;
  symbol: string;
}) {
  if (amount == null || decimals == null) {
    return <GeneralTableCell>-</GeneralTableCell>;
  }

  const formattedAmount = amount / Math.pow(10, decimals);
  return (
    <GeneralTableCell>
      <span>{formattedAmount}</span>
      <span style={{marginLeft: 8, color: grey[450]}}>{symbol}</span>
    </GeneralTableCell>
  );
});

const USDCell = React.memo(function USDCell({
  amount,
}: {
  amount: number | null | undefined;
}) {
  const inMainnet = useGetInMainnet();
  if (amount === null || amount === undefined || !inMainnet) {
    return <GeneralTableCell>N/A</GeneralTableCell>;
  }

  return (
    <GeneralTableCell>
      <span>${amount}</span>
      <span style={{marginLeft: 8, color: grey[450]}}>{"USD"}</span>
    </GeneralTableCell>
  );
});

const CoinTypeCell = React.memo(function CoinTypeCell({
  data,
}: {
  data: CoinDescriptionPlusAmount;
}) {
  function getType() {
    switch (data.tokenStandard) {
      case "v1":
        return HashType.COIN;
      case "v2":
        return HashType.FUNGIBLE_ASSET;
      default:
        return HashType.OTHERS;
    }
  }

  return (
    <GeneralTableCell
      sx={{
        maxWidth: {xs: 200, md: 350, lg: 450},
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      <HashButton
        hash={data.tokenAddress ?? data.faAddress ?? "Unknown"}
        type={getType()}
        size="large"
        img={data.logoUrl ? data.logoUrl : data.symbol}
      />
    </GeneralTableCell>
  );
});

const CoinVerifiedCell = React.memo(function CoinVerifiedCell({
  data,
}: {
  data: CoinDescriptionPlusAmount;
}) {
  return VerifiedCoinCell({
    data: {
      id: data.tokenAddress ?? data.faAddress ?? "Unknown",
      known: data.chainId !== 0,
      isBanned: data.isBanned,
      isInPanoraTokenList: data.isInPanoraTokenList,
      symbol: data?.panoraSymbol ?? data.symbol,
    },
  });
});

enum CoinVerificationFilterType {
  VERIFIED,
  RECOGNIZED,
  ALL,
  NONE, // Turns it off entirely
}

export type CoinDescriptionPlusAmount = {
  amount: number;
  tokenStandard: string;
  usdValue: number | null;
  assetType: string;
  assetVersion: string;
} & CoinDescription;

export function CoinsTable({coins}: {coins: CoinDescriptionPlusAmount[]}) {
  const networkName = useNetworkName();
  const [verificationFilter, setVerificationFilter] = React.useState(
    CoinVerificationFilterType.NONE,
  );

  // Set default filter based on network
  React.useEffect(() => {
    if (networkName === Network.MAINNET) {
      setVerificationFilter(CoinVerificationFilterType.VERIFIED);
    }
  }, [networkName]);

  const toIndex = useCallback((coin: CoinDescriptionPlusAmount): number => {
    return coin.panoraOrderIndex
      ? coin.panoraOrderIndex
      : coin.chainId !== 0
        ? 0
        : 1000000;
  }, []);

  const getCoinId = useCallback(
    (coin: CoinDescriptionPlusAmount): string | null => {
      return coin.tokenAddress ?? coin.faAddress;
    },
    [],
  );

  // Memoize coin verifications calculation
  const coinVerifications = useMemo<Record<string, VerifiedType>>(() => {
    const verifications: Record<string, VerifiedType> = {};
    coins.forEach((coin) => {
      const coinId = getCoinId(coin);
      if (coinId) {
        verifications[coinId] = verifiedLevel(
          {
            id: coin.tokenAddress ?? coin.faAddress ?? "Unknown",
            known: coin.chainId !== 0,
            isBanned: coin.isBanned,
            isInPanoraTokenList: coin.isInPanoraTokenList,
            symbol: coin?.panoraSymbol ?? coin.symbol,
          },
          networkName,
        ).level;
      }
    });
    return verifications;
  }, [coins, getCoinId, networkName]);

  // Memoize filter logic
  const filterCoins = useCallback(
    (
      coinsToFilter: CoinDescriptionPlusAmount[],
      filter: CoinVerificationFilterType,
    ): CoinDescriptionPlusAmount[] => {
      let filtered: CoinDescriptionPlusAmount[];

      switch (filter) {
        case CoinVerificationFilterType.VERIFIED:
          filtered = coinsToFilter.filter((coin) => {
            const coinId = getCoinId(coin);
            if (coinId && coinVerifications[coinId]) {
              const level = coinVerifications[coinId];
              return (
                level === VerifiedType.LABS_VERIFIED ||
                level === VerifiedType.COMMUNITY_VERIFIED ||
                level === VerifiedType.NATIVE_TOKEN
              );
            }
            return false;
          });
          break;
        case CoinVerificationFilterType.RECOGNIZED:
          filtered = coinsToFilter.filter((coin) => {
            const coinId = getCoinId(coin);
            if (coinId && coinVerifications[coinId]) {
              const level = coinVerifications[coinId];
              return (
                level === VerifiedType.LABS_VERIFIED ||
                level === VerifiedType.COMMUNITY_VERIFIED ||
                level === VerifiedType.NATIVE_TOKEN ||
                level === VerifiedType.RECOGNIZED
              );
            }
            return false;
          });
          break;
        case CoinVerificationFilterType.ALL:
        case CoinVerificationFilterType.NONE:
        default:
          filtered = coinsToFilter;
          break;
      }

      return filtered.sort((a, b) => toIndex(a) - toIndex(b));
    },
    [coinVerifications, getCoinId, toIndex],
  );

  // Memoize filtered and sorted coins
  const filteredCoins = useMemo(
    () => filterCoins(coins, verificationFilter),
    [coins, verificationFilter, filterCoins],
  );

  const selectedTextColor = primary[500];
  const unselectedTextColor = grey[400];
  const dividerTextColor = grey[200];

  const filterSelector = (
    <Stack
      direction="row"
      justifyContent="flex-end"
      spacing={1}
      marginY={0.5}
      height={16}
    >
      <Button
        variant="text"
        onClick={() =>
          setVerificationFilter(CoinVerificationFilterType.VERIFIED)
        }
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color:
            CoinVerificationFilterType.VERIFIED === verificationFilter
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
        onClick={() =>
          setVerificationFilter(CoinVerificationFilterType.RECOGNIZED)
        }
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color:
            CoinVerificationFilterType.RECOGNIZED === verificationFilter
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
        onClick={() => setVerificationFilter(CoinVerificationFilterType.ALL)}
        sx={{
          fontSize: 12,
          fontWeight: 600,
          color:
            CoinVerificationFilterType.ALL === verificationFilter
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

  // Memoize coin rows for virtualization
  const coinRows = useMemo(() => {
    return filteredCoins.map((coinDesc, i) => {
      let friendlyType = coinDesc.tokenStandard;
      switch (friendlyType) {
        case "v1":
          friendlyType = "Coin";
          break;
        case "v2":
          friendlyType = "Fungible Asset";
          break;
      }
      return (
        <GeneralTableRow key={i}>
          <CoinNameCell name={coinDesc.name} />
          <CoinNameCell name={friendlyType} />
          <CoinTypeCell data={coinDesc} />
          <CoinVerifiedCell data={coinDesc} />
          <AmountCell
            amount={coinDesc.amount}
            decimals={coinDesc.decimals}
            symbol={getAssetSymbol(
              coinDesc.panoraSymbol,
              coinDesc.bridge,
              coinDesc.symbol,
            )}
          />
          <USDCell amount={coinDesc.usdValue} />
        </GeneralTableRow>
      );
    });
  }, [filteredCoins]);

  // TODO: For FA, possibly add store as more info
  return (
    <>
      {verificationFilter !== CoinVerificationFilterType.NONE && filterSelector}
      <ResponsiveTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <GeneralTableHeaderCell header="Name" />
              <GeneralTableHeaderCell header="Asset Type" />
              <GeneralTableHeaderCell header="Asset" />
              <GeneralTableHeaderCell
                header="Verified"
                tooltip={getLearnMoreTooltip("coin_verification")}
                isTableTooltip={true}
              />
              <GeneralTableHeaderCell header="Amount" />
              <GeneralTableHeaderCell header="USD Value" />
            </TableRow>
          </TableHead>
          {filteredCoins.length > 0 ? (
            <VirtualizedTableBody
              estimatedRowHeight={60}
              virtualizationThreshold={15}
            >
              {coinRows}
            </VirtualizedTableBody>
          ) : (
            <GeneralTableBody>
              <TableRow>
                <GeneralTableCell colSpan={6} sx={{textAlign: "center", py: 3}}>
                  <Typography variant="body1" color="text.secondary">
                    No coins found
                  </Typography>
                </GeneralTableCell>
              </TableRow>
            </GeneralTableBody>
          )}
        </Table>
      </ResponsiveTableContainer>
    </>
  );
}
