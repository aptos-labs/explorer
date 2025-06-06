import * as React from "react";
import {useEffect} from "react";
import {
  Button,
  CircularProgress,
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
import {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {
  VerifiedCoinCell,
  verifiedLevel,
  VerifiedType,
} from "../../../components/Table/VerifiedCell";
import {getAssetSymbol} from "../../../utils";
import {getLearnMoreTooltip} from "../../Transaction/helpers";
import {useGlobalState} from "../../../global-config/GlobalConfig";
import {Network, parseTypeTag} from "@aptos-labs/ts-sdk";
import {useGetInMainnet} from "../../../api/hooks/useGetInMainnet";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import useSubmitTransaction from "../../../api/hooks/useSubmitTransaction";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import {Types} from "aptos";

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

function USDCell({amount}: {amount: number | null | undefined}) {
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

function CoinMigrationCell({
  resourceData,
  data,
}: {
  resourceData: Types.MoveResource[] | undefined;
  data: CoinDescriptionPlusAmount;
}) {
  const {submitTransaction, transactionResponse, transactionInProcess} =
    useSubmitTransaction();
  const tokenAddress = data.tokenAddress;

  let isMigrated = false;
  let icon = null;
  if (
    transactionResponse?.transactionSubmitted === undefined ||
    !transactionResponse.transactionSubmitted ||
    transactionResponse?.success === undefined
  ) {
    icon = null;
  } else if (
    transactionResponse?.transactionSubmitted &&
    transactionResponse.success
  ) {
    icon = <CheckCircleIcon />;
    isMigrated = true;
  } else if (
    transactionResponse?.transactionSubmitted &&
    !transactionResponse.success
  ) {
    icon = <ErrorOutlinedIcon />;
    isMigrated = false;
  }

  if (!tokenAddress) {
    return (
      <Button
        type="submit"
        disabled={true}
        variant="contained"
        sx={{width: "8rem", height: "3rem"}}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <span>No need to migrate</span>
        </Stack>
      </Button>
    );
  }

  if (
    isMigrated ||
    !resourceData?.find(
      (res) => res.type === `0x1::coin::CoinStore<${tokenAddress}>`,
    )
  ) {
    return (
      <>
        <Button
          type="submit"
          disabled={true}
          variant="contained"
          sx={{width: "8rem", height: "3rem"}}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <span>Already Migrated</span>
          </Stack>
        </Button>
        {icon}
      </>
    );
  }

  const onClick = async () => {
    const payload: InputTransactionData = {
      data: {
        function: "0x1::coin::migrate_to_fungible_store",
        typeArguments: [parseTypeTag(tokenAddress)],
        functionArguments: [],
      },
    };

    await submitTransaction(payload);
  };

  return (
    <>
      <Button
        type="submit"
        disabled={transactionInProcess}
        variant="contained"
        sx={{width: "8rem", height: "3rem"}}
        onClick={onClick}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {transactionInProcess ? (
            <CircularProgress size={30}></CircularProgress>
          ) : (
            <span>Migrate</span>
          )}
        </Stack>
      </Button>
      {icon}
    </>
  );
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
  usdValue: number | null;
  assetType: string;
  assetVersion: string;
} & CoinDescription;

export function CoinsTable({
  address,
  resourceData,
  coins,
}: {
  address: string;
  resourceData: Types.MoveResource[] | undefined;
  coins: CoinDescriptionPlusAmount[];
}) {
  const [state] = useGlobalState();
  const [verificationFilter, setVerificationFilter] = React.useState(
    CoinVerificationFilterType.NONE,
  );
  const {connected, account} = useWallet();

  const showMigrateButton =
    connected && account?.address !== undefined && account.address === address;

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

  function getCoinId(coin: CoinDescriptionPlusAmount): string | null {
    return coin.tokenAddress ?? coin.faAddress;
  }

  // TODO: This doesn't cover FAs converted from coins.  The logic for verification has gotten pretty out of hand
  // and needs to be consolidated before going any further
  const coinVerifications: Record<string, VerifiedType> = {};

  coins.forEach((coin) => {
    const coinId = getCoinId(coin);
    if (coinId) {
      coinVerifications[coinId] = verifiedLevel(
        {
          id: coin.tokenAddress ?? coin.faAddress ?? "Unknown",
          known: coin.chainId !== 0,
          isBanned: coin.isBanned,
          isInPanoraTokenList: coin.isInPanoraTokenList,
          symbol: coin?.panoraSymbol ?? coin.symbol,
        },
        state.network_name,
      ).level;
    }
  });

  switch (verificationFilter) {
    case CoinVerificationFilterType.VERIFIED:
      filteredCoins = coins.filter((coin) => {
        const coinId = getCoinId(coin);
        if (coinId && coinVerifications[coinId]) {
          const level = coinVerifications[coinId];
          return (
            level === VerifiedType.LABS_VERIFIED ||
            level === VerifiedType.COMMUNITY_VERIFIED ||
            level === VerifiedType.NATIVE_TOKEN
          );
        } else {
          return false;
        }
      });
      break;
    case CoinVerificationFilterType.RECOGNIZED:
      filteredCoins = coins.filter((coin) => {
        const coinId = getCoinId(coin);
        if (coinId && coinVerifications[coinId]) {
          const level = coinVerifications[coinId];
          return (
            level === VerifiedType.LABS_VERIFIED ||
            level === VerifiedType.COMMUNITY_VERIFIED ||
            level === VerifiedType.NATIVE_TOKEN ||
            level === VerifiedType.RECOGNIZED
          );
        } else {
          return false;
        }
      });

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
            <GeneralTableHeaderCell header="USD Value" />
            {showMigrateButton && (
              <GeneralTableHeaderCell header="Migrate to FA" />
            )}
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

                <USDCell amount={coinDesc.usdValue} />
                {showMigrateButton && (
                  <CoinMigrationCell
                    resourceData={resourceData}
                    data={coinDesc}
                  />
                )}
              </GeneralTableRow>
            );
          })}
        </GeneralTableBody>
      </Table>
    </>
  );
}
