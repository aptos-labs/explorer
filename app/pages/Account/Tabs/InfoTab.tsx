import {Types} from "aptos";
import {Box} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import EmptyTabContent from "../../../components/IndividualPageContent/EmptyTabContent";
import {getLearnMoreTooltip} from "../../Transaction/helpers";
import {useTheme} from "@mui/material";
import {tryStandardizeAddress} from "../../../utils";
import HashButton, {HashType} from "../../../components/HashButton";

type InfoTabProps = {
  address: string;
  accountData: Types.AccountData | undefined;
  objectData: Types.MoveResource | undefined;
};

export default function InfoTab({
  address,
  accountData,
  objectData,
}: InfoTabProps) {
  const theme = useTheme();
  if (!accountData && !objectData) {
    return <EmptyTabContent />;
  }

  let accountInfo = null;
  if (accountData) {
    const keyRotated =
      tryStandardizeAddress(address) !==
      tryStandardizeAddress(accountData.authentication_key);

    accountInfo = (
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
                  <span
                    style={{marginLeft: 8, color: theme.palette.text.secondary}}
                  >
                    (rotated)
                  </span>
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

  let objectInfo = null;
  if (objectData) {
    const objData = objectData.data as {
      owner: string;
      allow_ungated_transfer: boolean;
    };
    objectInfo = (
      <Box marginBottom={3}>
        <ContentBox>
          <ContentRow
            title={"Owner:"}
            value={<HashButton hash={objData.owner} type={HashType.ACCOUNT} />}
            tooltip={getLearnMoreTooltip("owner")}
          />
          <ContentRow
            title={"Transferrable:"}
            value={objData.allow_ungated_transfer ? "Yes" : "No"}
            tooltip={getLearnMoreTooltip("allow_ungated_transfer")}
          />
        </ContentBox>
      </Box>
    );
  }

  return (
    <>
      {accountInfo}
      {objectInfo}
    </>
  );
}
