import {Box} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {getLearnMoreTooltip} from "../../Transaction/helpers";
import {AccountData, MoveResource} from "@aptos-labs/ts-sdk";

type InfoTabProps = {
  address: string;
  accountData: AccountData | MoveResource[] | undefined;
};

export default function InfoTab({accountData}: InfoTabProps) {
  if (!accountData || Array.isArray(accountData)) {
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
