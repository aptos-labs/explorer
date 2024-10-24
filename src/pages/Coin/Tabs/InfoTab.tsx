import {Box, Typography} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import HashButton, {HashType} from "../../../components/HashButton";
import {CoinData} from "../Components/CoinData";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {VerifiedCoinCell} from "../../../components/Table/VerifiedCell";
import {getAssetSymbol} from "../../../utils";

type InfoTabProps = {
  struct: string;
  data: CoinData | undefined;
  supply: bigint | null;
  coinData: CoinDescription | undefined;
};

export default function InfoTab({
  struct,
  data,
  supply,
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
          <ContentRow
            title={"Name:"}
            value={
              <Typography
                sx={{
                  display: "flex",
                  fontSize: "inherit",
                  alignItems: "row",
                  gap: 1,
                }}
              >
                <span>{data?.data?.name}</span>
                <VerifiedCoinCell
                  data={{
                    id: struct,
                    known: !!coinData,
                    isBanned: coinData?.isBanned,
                    isInPanoraTokenList: coinData?.isInPanoraTokenList,
                  }}
                />
              </Typography>
            }
          />
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
              coinData?.logoUrl ? (
                <img width={200} src={coinData?.logoUrl} />
              ) : null
            }
          />
          <ContentRow title={"Project URL:"} value={coinData?.websiteUrl} />
          <ContentRow
            title={"Creator:"}
            value={
              <HashButton
                hash={struct.split("::")[0]}
                type={HashType.ACCOUNT}
              />
            }
          />
        </ContentBox>
      )}
    </Box>
  );
}
