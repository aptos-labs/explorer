import {Box, Typography} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {findCoinData} from "../../Transaction/Tabs/BalanceChangeTab";
import {VerifiedCoinCell} from "../../../components/Table/VerifiedCell";
import {getAssetSymbol} from "../../../utils";

type InfoTabProps = {
  address: string;
  data: any | undefined;
};

export default function InfoTab({address, data}: InfoTabProps) {
  if (!data || Array.isArray(data)) {
    return <EmptyTabContent />;
  }

  // TODO: add owner
  // TODO: add migrated coin balance?
  // TODO: Look into making URLs clickable, right now don't want scams

  let formattedSupply: string | null = null;
  if (data?.supply !== undefined && data?.supply !== null && data?.metadata) {
    formattedSupply =
      getFormattedBalanceStr(data?.supply.toString(), data.metadata?.decimals) +
      " " +
      data.metadata?.symbol;
  }

  const coinData = findCoinData(data?.coinData?.data, address);

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
                <span>{data?.metadata?.name}</span>
                <VerifiedCoinCell
                  data={{
                    id: address,
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
              data?.metadata?.symbol,
            )}
          />
          <ContentRow
            title={"Decimals:"}
            value={data?.metadata?.decimals?.toString()}
          />
          <ContentRow title={"Total supply:"} value={formattedSupply} />
          <ContentRow
            title={"Icon:"}
            value={
              coinData?.logoUrl ? (
                <img width={200} src={coinData?.logoUrl} />
              ) : (
                data?.metadata?.icon_uri && (
                  <img width={200} src={data?.metadata?.icon_uri} />
                )
              )
            }
          />
          <ContentRow
            title={"Project URL:"}
            value={
              coinData?.websiteUrl
                ? coinData.websiteUrl
                : data?.metadata?.project_uri && data?.metadata?.project_uri
            }
          />
        </ContentBox>
      )}
    </Box>
  );
}
