import * as React from "react";
import {
  Button,
  Stack,
  Table,
  TableRow,
  Typography,
  TableHead,
} from "@mui/material";
import GeneralTableRow from "../../../components/Table/GeneralTableRow";
import GeneralTableHeaderCell from "../../../components/Table/GeneralTableHeaderCell";
import HashButton, {HashType} from "../../../components/HashButton";
import {grey, primary} from "../../../themes/colors/aptosColorPalette";
import GeneralTableBody from "../../../components/Table/GeneralTableBody";
import GeneralTableCell from "../../../components/Table/GeneralTableCell";
import {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {VerifiedCoinCell} from "../../../components/Table/VerifiedCell";
import {getAssetSymbol} from "../../../utils";
import {getLearnMoreTooltip} from "../../Transaction/helpers";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {useEffect} from "react";
import {Network} from "@aptos-labs/ts-sdk";

function CoinNameCell({name}: {name: string}) {
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
}

function AmountCell({
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
}

function CoinTypeCell({data}: {data: CoinDescriptionPlusAmount}) {
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
    <GeneralTableCell sx={{width: 450}}>
      <HashButton
        hash={data.tokenAddress ?? data.faAddress ?? "Unknown"}
        type={getType()}
        size="large"
        img={data.logoUrl ? data.logoUrl : data.symbol}
      />
    </GeneralTableCell>
  );
}

function CoinVerifiedCell({data}: {data: CoinDescriptionPlusAmount}) {
  return VerifiedCoinCell({
    data: {
      id: data.tokenAddress ?? data.faAddress ?? "Unknown",
      known: data.chainId !== 0,
      isBanned: data.isBanned,
      isInPanoraTokenList: data.isInPanoraTokenList,
      symbol: data?.panoraSymbol ?? data.symbol,
    },
  });
}

enum CoinVerificationFilterType {
  VERIFIED,
  RECOGNIZED,
  ALL,
  NONE, // Turns it off entirely
}

export type CoinDescriptionPlusAmount = {
  amount: number;
  tokenStandard: string;
} & CoinDescription;

export function CoinsTable({coins}: {coins: CoinDescriptionPlusAmount[]}) {
  const [state] = useGlobalState();
  const [verificationFilter, setVerificationFilter] = React.useState(
    CoinVerificationFilterType.NONE,
  );

  useEffect(() => {
    if (state.network_name === Network.MAINNET) {
      setVerificationFilter(CoinVerificationFilterType.VERIFIED);
    }
  }, [state, state.network_value]);

  function toIndex(coin: CoinDescriptionPlusAmount): number {
    return coin.panoraOrderIndex
      ? coin.panoraOrderIndex
      : coin.chainId !== 0
        ? 0
        : 1000000;
  }

  let filteredCoins = coins;
  switch (verificationFilter) {
    case CoinVerificationFilterType.VERIFIED:
      filteredCoins = coins.filter((coin) => coin.isInPanoraTokenList);
      break;
    case CoinVerificationFilterType.RECOGNIZED:
      filteredCoins = coins.filter((coin) => coin.chainId !== 0);
      break;
    case CoinVerificationFilterType.ALL:
    case CoinVerificationFilterType.NONE:
      filteredCoins = coins;
      break;
  }
  filteredCoins = filteredCoins.sort((a, b) => toIndex(a) - toIndex(b));

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

  // TODO: For FA, possibly add store as more info
  return (
    <>
      {verificationFilter !== CoinVerificationFilterType.NONE && filterSelector}
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
          </TableRow>
        </TableHead>
        <GeneralTableBody>
          {filteredCoins.map((coinDesc, i) => {
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
              </GeneralTableRow>
            );
          })}
        </GeneralTableBody>
      </Table>
    </>
  );
}
