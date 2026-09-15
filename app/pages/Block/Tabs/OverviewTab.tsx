import {
  type Block,
  type BlockMetadataTransactionResponse,
  isBlockMetadataTransactionResponse,
  type TransactionResponse,
} from "@aptos-labs/ts-sdk";
import {Box} from "@mui/material";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {Link} from "../../../routing";
import {getLearnMoreTooltip} from "../../Transaction/helpers";

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
        titleKey="fields.proposer"
        value={<HashButton hash={txn.proposer} type={HashType.ACCOUNT} />}
        tooltip={getLearnMoreTooltip("proposer")}
      />
      <ContentRow
        titleKey="fields.epoch"
        value={txn.epoch}
        tooltip={getLearnMoreTooltip("epoch")}
      />
      <ContentRow
        titleKey="fields.round"
        value={txn.round}
        tooltip={getLearnMoreTooltip("round")}
      />
      <ContentRow
        titleKey="fields.previousBlock"
        value={
          <Link to={`/block/${previousBlock}`} underline="none">
            {previousBlock}
          </Link>
        }
        tooltip={getLearnMoreTooltip("block")}
      />
      <ContentRow
        titleKey="fields.nextBlock"
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
      <Box
        sx={{
          marginBottom: 3,
        }}
      >
        <ContentBox>
          <ContentRow
            titleKey="fields.blockHeight"
            value={data.block_height}
            tooltip={getLearnMoreTooltip("block_height")}
          />
          <ContentRow
            title={`Transactions (${BigInt(data.last_version) - BigInt(data.first_version) + 1n}):`}
            value={<VersionValue data={data} />}
            tooltip={getLearnMoreTooltip("version")}
          />
          <ContentRow
            titleKey="fields.timestamp"
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
