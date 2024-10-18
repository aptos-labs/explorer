import {Types} from "aptos";
import {Box} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {getLearnMoreTooltip} from "../../Transaction/helpers";
import {AccountAddress} from "@aptos-labs/ts-sdk";
import {grey} from "../../../themes/colors/aptosColorPalette";

type InfoTabProps = {
  address: string;
  accountData: Types.AccountData | Types.MoveResource[] | undefined;
};

export default function InfoTab({address, accountData}: InfoTabProps) {
  if (!accountData || Array.isArray(accountData)) {
    return <EmptyTabContent />;
  }

  const keyRotated = !AccountAddress.from(address).equals(
    AccountAddress.from(accountData.authentication_key),
  );

  return (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow
          title={"Sequence Number:"}
          value={accountData.sequence_number}
          tooltip={getLearnMoreTooltip("sequence_number")}
        />
        {keyRotated ? (
          <ContentRow
            title={"Authentication Key:"}
            value={
              <>
                {`${accountData.authentication_key} `}
                <span style={{marginLeft: 8, color: grey[450]}}>(rotated)</span>
              </>
            }
            tooltip={getLearnMoreTooltip("authentication_key")}
          />
        ) : (
          <ContentRow
            title={"Authentication Key:"}
            value={accountData.authentication_key}
            tooltip={getLearnMoreTooltip("authentication_key")}
          />
        )}
      </ContentBox>
    </Box>
  );
}
