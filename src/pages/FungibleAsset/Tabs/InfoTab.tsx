import {Box} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import {getAssetSymbol} from "../../../utils";
import HashButton, {HashType} from "../../../components/HashButton";
import {FACombinedData} from "../Index";

type InfoTabProps = {
  address: string;
  data: FACombinedData | undefined;
};

// TODO: put this extra information somewhere else
const extraInfo: Record<string, string> = {
  "0x000000000000000000000000000000000000000000000000000000000000000a":
    "This is the official native gas token on Aptos.  This is the fungible asset version of APT.  It is fully compatible with the coin version when using 0x1::coin functions.  See 0x1::aptos_coin::AptosCoin for the coin version.",
  "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b":
    "This is the official native USD₮ on Aptos.",
};

function ExtraInfo({address}: {address: string}) {
  if (extraInfo[address]) {
    return (
      <ContentRow
        title={"Additional Information:"}
        value={extraInfo[address]}
      />
    );
  }

  return null;
}

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
                  alt={`${data?.metadata?.name} icon (${icon_uri})`}
                  src={icon_uri}
                />
              )
            }
          />
          <ExtraInfo address={address} />
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
            value={
              <HashButton size="large" hash={address} type={HashType.OBJECT} />
            }
          />
          {data.pairedCoin && (
            <ContentRow
              title={"Paired Coin:"}
              value={
                <HashButton
                  size="large"
                  hash={data.pairedCoin}
                  type={HashType.COIN}
                />
              }
            />
          )}
        </ContentBox>
      )}
    </Box>
  );
}
