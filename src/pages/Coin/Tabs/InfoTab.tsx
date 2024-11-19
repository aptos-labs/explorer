import {Box} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import HashButton, {HashType} from "../../../components/HashButton";
import {CoinData} from "../Components/CoinData";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {getAssetSymbol} from "../../../utils";

type InfoTabProps = {
  struct: string;
  data: CoinData | undefined;
  supply: bigint | null;
  pairedFa: string | null;
  coinData: CoinDescription | undefined;
};

export default function InfoTab({
  struct,
  data,
  supply,
  pairedFa,
  coinData,
}: InfoTabProps) {
  if (!data || Array.isArray(data)) {
    return <EmptyTabContent />;
  }

  let formattedSupply: string | null = null;
  if (supply !== undefined && supply !== null) {
    formattedSupply =
      getFormattedBalanceStr(supply.toString(), data.data.decimals) +
      " " +
      data.data.symbol;
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
          <ContentRow title={"Total supply:"} value={formattedSupply} />
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
