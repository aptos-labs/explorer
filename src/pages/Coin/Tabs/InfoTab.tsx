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
};

export default function InfoTab({struct, data}: InfoTabProps) {
  if (!data || Array.isArray(data)) {
    return <EmptyTabContent />;
  }

  // TODO: add hook for image, and the panora symbol

  function getSupply(): string {
    if (!data) {
      return "N/A";
    }

    if (data.data.supply.vec.length > 0) {
      if (data.data.supply.vec[0].aggregator.vec.length > 0) {
        // TODO: Lookup table for handle
        return "N/A";
      }
      if (data.data.supply.vec[0].integer.vec.length > 0) {
        return (
          getFormattedBalanceStr(
            data.data.supply.vec[0].integer.vec[0].value,
            data.data.decimals,
          ) +
          " " +
          data.data.symbol
        );
      }
    }

    return "N/A";
  }

  return (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow title={"Name:"} value={data.data.name} />
        <ContentRow title={"Symbol:"} value={data.data.symbol} />
        <ContentRow title={"Decimals:"} value={data.data.decimals} />
        <ContentRow title={"Total supply:"} value={getSupply()} />
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
