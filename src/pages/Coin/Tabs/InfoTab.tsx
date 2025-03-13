import {Box} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import HashButton, {HashType} from "../../../components/HashButton";
import {CoinData} from "../Components/CoinData";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {assertNever, getAssetSymbol} from "../../../utils";
import {SupplyType} from "../../../api/hooks/useGetCoinSupplyLimit";
import Tooltip from "@mui/material/Tooltip";
import VerifiedOutlined from "@mui/icons-material/VerifiedOutlined";
import {VerifiedTwoTone} from "@mui/icons-material";
import QuestionMarkOutlined from "@mui/icons-material/QuestionMarkOutlined";

type InfoTabProps = {
  struct: string;
  data: CoinData | undefined;
  supplyInfo: [bigint | null, SupplyType | null];
  pairedFa: string | null;
  coinData: CoinDescription | undefined;
};

export default function InfoTab({
  struct,
  data,
  supplyInfo,
  pairedFa,
  coinData,
}: InfoTabProps) {
  if (!data || Array.isArray(data)) {
    return <EmptyTabContent />;
  }

  const [supply, supplyType] = supplyInfo;
  let supplyIcon = null;
  switch (supplyType) {
    case SupplyType.ON_CHAIN:
      supplyIcon = (
        <Tooltip title={"Supply tracked on-chain, may change over time"}>
          <VerifiedOutlined />
        </Tooltip>
      );
      break;
    case SupplyType.VERIFIED_OFF_CHAIN:
      supplyIcon = (
        <Tooltip title={"Supply verified off-chain to have a fixed supply"}>
          <VerifiedTwoTone />
        </Tooltip>
      );
      break;
    case SupplyType.NO_SUPPLY_TRACKED:
      supplyIcon = (
        <Tooltip
          title={"No supply is tracked for this coin on-chain or off-chain"}
        >
          <QuestionMarkOutlined />
        </Tooltip>
      );
      break;
    case null:
      break;
    default:
      assertNever(supplyType);
  }

  let marketCap = null;
  let formattedSupply: string | null = null;
  if (supply !== undefined && supply !== null) {
    formattedSupply =
      getFormattedBalanceStr(supply.toString(), data.data.decimals) +
      " " +
      data.data.symbol;
    marketCap =
      parseFloat(coinData?.usdPrice ?? "0") *
      Number(supply / 10n ** BigInt(coinData?.decimals ?? 0));
  }

  return (
    <Box marginBottom={3}>
      {data && (
        <ContentBox>
          <ContentRow title={"Name:"} value={data?.data?.name} />
          <ContentRow
            title={"Symbol:"}
            value={getAssetSymbol(
              coinData?.panoraSymbol,
              coinData?.bridge,
              data?.data?.symbol,
            )}
          />
          <ContentRow
            title={"Decimals:"}
            value={data?.data?.decimals?.toString()}
          />
          {formattedSupply !== null ? (
            <>
              <ContentRow
                title={"Total supply:"}
                value={
                  <>
                    {`${formattedSupply} `}
                    {supplyIcon}
                  </>
                }
              />
              {/* {marketCap ? (
                <ContentRow
                  title={"Current Market Cap (supply * price):"}
                  value={
                    <>
                      $
                      {marketCap.toLocaleString([], {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      })}{" "}
                      USD
                    </>
                  }
                />
              ) : null} */}
            </>
          ) : (
            <ContentRow title={"Total supply:"} value={supplyIcon} />
          )}
          <ContentRow
            title={"Icon:"}
            value={
              coinData?.logoUrl && (
                <img
                  alt={`${data?.data?.name} icon`}
                  width={100}
                  src={coinData?.logoUrl}
                />
              )
            }
          />
          <ContentRow title={"Project URL:"} value={coinData?.websiteUrl} />
          <ContentRow
            title={"Creator:"}
            value={
              <HashButton
                size="large"
                hash={struct.split("::")[0]}
                type={HashType.ACCOUNT}
              />
            }
          />
          {pairedFa && (
            <ContentRow
              title={"Paired FA:"}
              value={
                <HashButton
                  size="large"
                  hash={pairedFa}
                  type={HashType.FUNGIBLE_ASSET}
                />
              }
            />
          )}
        </ContentBox>
      )}
    </Box>
  );
}
