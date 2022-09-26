import {Types} from "aptos";
import {Box, Link} from "@mui/material";
import React from "react";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {getLearnMoreTooltip} from "../../Transaction/helpers";
import HashButton, {HashType} from "../../../components/HashButton";

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

function BlockMetadataRows({
  blockTxn,
}: {
  blockTxn: Types.Transaction | undefined;
}) {
  if (!blockTxn) {
    return null;
  }

  const txn = blockTxn as Types.Transaction_BlockMetadataTransaction;

  return (
    <>
      <ContentRow
        title="Proposer:"
        value={<HashButton hash={txn.proposer} type={HashType.ACCOUNT} />}
        tooltip={getLearnMoreTooltip("proposer")}
      />
      <ContentRow
        title="Round:"
        value={txn.round}
        tooltip={getLearnMoreTooltip("round")}
      />
    </>
  );
}

type OverviewTabProps = {
  data: Types.Block;
};

export default function OverviewTab({data}: OverviewTabProps) {
  const blockTxn: Types.Transaction | undefined = (
    data.transactions ?? []
  ).find((txn) => {
    return txn.type === "block_metadata_transaction";
  });

  return (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow
          title={"Block Height:"}
          value={data.block_height}
          tooltip={getLearnMoreTooltip("block_height")}
        />
        <ContentRow
          title={"Version:"}
          value={<VersionValue data={data} />}
          tooltip={getLearnMoreTooltip("version")}
        />
        <ContentRow
          title={"Timestamp:"}
          value={<TimestampValue timestamp={data.block_timestamp} />}
          tooltip={getLearnMoreTooltip("timestamp")}
        />
        <BlockMetadataRows blockTxn={blockTxn} />
      </ContentBox>
    </Box>
  );
}
