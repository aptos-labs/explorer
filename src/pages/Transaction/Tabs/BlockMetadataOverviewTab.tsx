import * as React from "react";
import {Box} from "@mui/material";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import TransactionBlockRow from "./Components/TransactionBlockRow";
import {
  isBlockMetadataTransactionResponse,
  TransactionResponse,
} from "@aptos-labs/ts-sdk";

type BlockMetadataOverviewTabProps = {
  transaction: TransactionResponse;
};

export default function BlockMetadataOverviewTab({
  transaction,
}: BlockMetadataOverviewTabProps) {
  if (!isBlockMetadataTransactionResponse(transaction)) {
    return <></>;
  }

  return (
    <Box marginBottom={3}>
      <ContentBox padding={4}>
        <ContentRow
          title={"Version:"}
          value={<Box sx={{fontWeight: 600}}>{transaction.version}</Box>}
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
            <HashButton hash={transaction.proposer} type={HashType.ACCOUNT} />
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
        <TransactionBlockRow version={transaction.version} />
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
          value={
            <TimestampValue
              timestamp={transaction.timestamp}
              ensureMilliSeconds
            />
          }
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
