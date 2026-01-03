import {Box} from "@mui/material";
import React from "react";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {Link} from "../../../routing";
import {getLearnMoreTooltip} from "../../Transaction/helpers";
import {
  Block,
  BlockMetadataTransactionResponse,
  isBlockMetadataTransactionResponse,
  TransactionResponse,
} from "@aptos-labs/ts-sdk";

function VersionValue({data}: {data: Block}) {
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
  block: Block;
  blockTxn: TransactionResponse | undefined;
}) {
  if (!blockTxn) {
    return null;
  }

  const txn = blockTxn as BlockMetadataTransactionResponse;
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
  data: Block;
};

export default function OverviewTab({data}: OverviewTabProps) {
  const blockTxn: TransactionResponse | undefined = (
    data.transactions ?? []
  ).find(isBlockMetadataTransactionResponse);

  return (
    blockTxn && (
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
    )
  );
}
