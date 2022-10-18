import {Types} from "aptos";
import {Box} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {getLearnMoreTooltip} from "../../Transaction/helpers";

type InfoTabProps = {
  address: string;
  accountData: Types.AccountData | undefined;
};

export default function InfoTab({accountData}: InfoTabProps) {
  if (!accountData) {
    return <EmptyTabContent />;
  }

  return (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow
          title={"Sequence Number:"}
          value={accountData.sequence_number}
          tooltip={getLearnMoreTooltip("sequence_number")}
        />
        <ContentRow
          title={"Authentication Key:"}
          value={accountData.authentication_key}
          tooltip={getLearnMoreTooltip("authentication_key")}
        />
      </ContentBox>
    </Box>
  );
}
