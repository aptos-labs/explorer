import {Box} from "@mui/material";
import React from "react";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";

type OverviewTabProps = {
  // TODO: add graphql data typing
  data: any;
};

// TODO: add more contents
export default function OverviewTab({data}: OverviewTabProps) {
  return (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow title={"Collection Name:"} value={data?.collection_name} />
        <ContentRow
          title={"Creator:"}
          value={
            <HashButton hash={data?.creator_address} type={HashType.ACCOUNT} />
          }
        />
        <ContentRow title={"Description:"} value={data?.description_mutable} />
      </ContentBox>
    </Box>
  );
}
