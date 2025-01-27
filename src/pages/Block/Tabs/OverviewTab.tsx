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
  block,
  blockTxn,
}: {
  block: Types.Block;
  blockTxn: Types.Transaction | undefined;
}) {
  if (!blockTxn) {
    return null;
  }

  const txn = blockTxn as Types.Transaction_BlockMetadataTransaction;
  const previousBlock = (BigInt(block.block_height) - 1n).toString();
  const nextBlock = (BigInt(block.block_height) + 1n).toString();
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
      <ContentRow
        title="Previous Block:"
        value={
          <Link to={`/block/${previousBlock}`} underline="none">
            {previousBlock}
          </Link>
        }
        tooltip={getLearnMoreTooltip("block")}
      />
      <ContentRow
        title="Next Block:"
        value={
          <Link to={`/block/${nextBlock}`} underline="none">
            {nextBlock}
          </Link>
        }
        tooltip={getLearnMoreTooltip("block")}
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
          title={`Transactions (${BigInt(data.last_version) - BigInt(data.first_version) + 1n}):`}
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
        <BlockMetadataRows block={data} blockTxn={blockTxn} />
      </ContentBox>
    </Box>
  );
}
