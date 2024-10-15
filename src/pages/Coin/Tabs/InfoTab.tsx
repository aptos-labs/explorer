import {Box} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import HashButton, {HashType} from "../../../components/HashButton";
import {CoinData} from "../Components/CoinData";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";

type InfoTabProps = {
  struct: string;
  data: CoinData | undefined;
  supply: bigint | null;
};

export default function InfoTab({struct, data, supply}: InfoTabProps) {
  if (!data || Array.isArray(data)) {
    return <EmptyTabContent />;
  }

  // TODO: add hook for image, and the panora symbol

  let formattedSupply: string | null = null;
  if (supply !== undefined && supply !== null) {
    formattedSupply =
      getFormattedBalanceStr(supply.toString(), data.data.decimals) +
      " " +
      data.data.symbol;
  }

  return (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow title={"Name:"} value={data.data.name} />
        <ContentRow title={"Symbol:"} value={data.data.symbol} />
        <ContentRow title={"Decimals:"} value={data.data.decimals.toString()} />
        <ContentRow title={"Total supply:"} value={formattedSupply} />
        <ContentRow
          title={"Creator:"}
          value={
            <HashButton hash={struct.split("::")[0]} type={HashType.ACCOUNT} />
          }
        />
      </ContentBox>
    </Box>
  );
}
