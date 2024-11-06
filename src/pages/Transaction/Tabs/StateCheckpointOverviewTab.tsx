import * as React from "react";
import {Box} from "@mui/material";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import TransactionBlockRow from "./Components/TransactionBlockRow";
import {
  StateCheckpointTransactionResponse,
  TransactionResponse,
} from "@aptos-labs/ts-sdk";

type StateCheckpointOverviewTabProps = {
  transaction: TransactionResponse;
};

export default function StateCheckpointOverviewTab({
  transaction,
}: StateCheckpointOverviewTabProps) {
  const transactionData = transaction as StateCheckpointTransactionResponse;

  return (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow
          title={"Version:"}
          value={<Box sx={{fontWeight: 600}}>{transactionData.version}</Box>}
          tooltip={getLearnMoreTooltip("version")}
        />
        <ContentRow
          title="Status:"
          value={<TransactionStatus success={transactionData.success} />}
          tooltip={getLearnMoreTooltip("status")}
        />
        <TransactionBlockRow version={transactionData.version} />
        {"timestamp" in transactionData && (
          <ContentRow
            title="Timestamp:"
            value={
              <TimestampValue
                timestamp={transactionData.timestamp}
                ensureMilliSeconds
              />
            }
            tooltip={getLearnMoreTooltip("timestamp")}
          />
        )}
        <ContentRow
          title="VM Status:"
          value={transactionData.vm_status}
          tooltip={getLearnMoreTooltip("vm_status")}
        />
      </ContentBox>
      <ContentBox>
        <ContentRow
          title="State Change Hash:"
          value={transactionData.state_change_hash}
          tooltip={getLearnMoreTooltip("state_change_hash")}
        />
        <ContentRow
          title="Event Root Hash:"
          value={transactionData.event_root_hash}
          tooltip={getLearnMoreTooltip("event_root_hash")}
        />
        <ContentRow
          title="Accumulator Root Hash:"
          value={transactionData.accumulator_root_hash}
          tooltip={getLearnMoreTooltip("accumulator_root_hash")}
        />
      </ContentBox>
    </Box>
  );
}
