import {Types} from "aptos";
import {Box, Link} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";

function VersionValue({data}: {data: Types.Block}) {
  const {first_version, last_version} = data;
  return (
    <>
      <Link href={`/txn/${first_version}`} underline="none">
        {first_version}
      </Link>
      {" - "}
      <Link href={`/txn/${last_version}`} underline="none">
        {last_version}
      </Link>
    </>
  );
}

type OverviewTabProps = {
  data: Types.Block;
};

export default function OverviewTab({data}: OverviewTabProps) {
  return (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow title={"Block Height:"} value={data.block_height} />
        <ContentRow title={"Version:"} value={<VersionValue data={data} />} />
        <ContentRow
          title={"Timestamp:"}
          value={<TimestampValue timestamp={data.block_timestamp} />}
        />
      </ContentBox>
    </Box>
  );
}
