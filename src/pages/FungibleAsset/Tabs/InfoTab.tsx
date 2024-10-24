import {Box} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {getAssetSymbol} from "../../../utils";
import HashButton, {HashType} from "../../../components/HashButton";

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

  const icon_uri = data?.coinData?.logoUrl ?? data?.metadata?.icon_uri;

  return (
    <Box marginBottom={3}>
      {data && (
        <ContentBox>
          <ContentRow title={"Name:"} value={data?.metadata?.name} />
          <ContentRow
            title={"Symbol:"}
            value={getAssetSymbol(
              data?.coinData?.panoraSymbol,
              data?.coinData?.bridge,
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
              icon_uri && (
                <img
                  width={100}
                  alt={`${data?.metadata?.name} icon`}
                  src={icon_uri}
                />
              )
            }
          />
          <ContentRow
            title={"Project URL:"}
            value={
              data?.coinData?.websiteUrl
                ? data?.coinData.websiteUrl
                : data?.metadata?.project_uri
            }
          />
          <ContentRow
            title={"Object Details:"}
            value={<HashButton hash={address} type={HashType.OBJECT} />}
          />
        </ContentBox>
      )}
    </Box>
  );
}
