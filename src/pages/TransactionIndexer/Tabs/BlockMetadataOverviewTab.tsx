import {Box} from "@mui/material";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import TransactionBlockRow from "./Components/TransactionBlockRow";
import {Block_Metadata_Transaction} from "../../../gql/graphql";

type BlockMetadataOverviewTabProps = {
  transaction: Block_Metadata_Transaction;
};

export default function BlockMetadataOverviewTab({
  transaction,
}: BlockMetadataOverviewTabProps) {
  return (
    <Box marginBottom={3}>
      <ContentBox padding={4}>
        <ContentRow
          title={"Version:"}
          value={
            <Box sx={{fontWeight: 600}}>{transaction.transaction_version}</Box>
          }
          tooltip={getLearnMoreTooltip("version")}
        />
        <ContentRow
          title="Status:"
          value={<TransactionStatus success={transaction.success} />}
          tooltip={getLearnMoreTooltip("status")}
        />
        <ContentRow
          title="Proposer:"
          value={
            <HashButton hash={transaction.proposer!} type={HashType.ACCOUNT} />
          }
          tooltip={getLearnMoreTooltip("proposer")}
        />
        <ContentRow
          title="ID:"
          value={transaction.id}
          tooltip={getLearnMoreTooltip("id")}
        />
      </ContentBox>
      <ContentBox>
        <TransactionBlockRow version={transaction.transaction_version} />
        <ContentRow
          title="Epoch:"
          value={transaction.epoch}
          tooltip={getLearnMoreTooltip("epoch")}
        />
        <ContentRow
          title="Round:"
          value={transaction.round}
          tooltip={getLearnMoreTooltip("round")}
        />
        <ContentRow
          title="Timestamp:"
          value={<TimestampValue timestamp={transaction.timestamp} />}
          tooltip={getLearnMoreTooltip("timestamp")}
        />
        <ContentRow
          title="VM Status:"
          value={transaction.vm_status}
          tooltip={getLearnMoreTooltip("vm_status")}
        />
      </ContentBox>
      <ContentBox>
        <ContentRow
          title="State Change Hash:"
          value={transaction.state_change_hash}
          tooltip={getLearnMoreTooltip("state_change_hash")}
        />
        <ContentRow
          title="Event Root Hash:"
          value={transaction.event_root_hash}
          tooltip={getLearnMoreTooltip("event_root_hash")}
        />
        <ContentRow
          title="Accumulator Root Hash:"
          value={transaction.accumulator_root_hash}
          tooltip={getLearnMoreTooltip("accumulator_root_hash")}
        />
      </ContentBox>
    </Box>
  );
}
