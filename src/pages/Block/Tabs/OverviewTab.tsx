import {Box} from "@mui/material";
import {Types} from "aptos";
import React from "react";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {Link} from "../../../routing";
import {getLearnMoreTooltip} from "../../Transaction/helpers";

function isBlockMetadataTransaction(
  txn: Types.Transaction,
): txn is Types.Transaction_BlockMetadataTransaction {
  return (
    (txn as Types.Transaction_BlockMetadataTransaction).type ===
    "block_metadata_transaction"
  );
}

function VersionValue({data}: {data: Types.Block}) {
  const {first_version, last_version} = data;
  return (
    <>
      <Link to={`/txn/${first_version}`} underline="none">
        {first_version}
      </Link>
      {" - "}
      <Link to={`/txn/${last_version}`} underline="none">
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
        title="Epoch:"
        value={txn.epoch}
        tooltip={getLearnMoreTooltip("epoch")}
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
  ).find(isBlockMetadataTransaction);

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
          value={
            <TimestampValue
              timestamp={data.block_timestamp}
              ensureMilliSeconds
            />
          }
          tooltip={getLearnMoreTooltip("timestamp")}
        />
        <BlockMetadataRows blockTxn={blockTxn} />
      </ContentBox>
    </Box>
  );
}
