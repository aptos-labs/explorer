import * as React from "react";
import {Types} from "aptos";
import {Alert, Box} from "@mui/material";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {getLearnMoreTooltip} from "../helpers";
import {TransactionStatus} from "../../../components/TransactionStatus";
import TransactionBlockRow from "./Components/TransactionBlockRow";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";

type UnknownTabProps = {
  transaction: Types.Transaction;
};

export default function UnknownTab({transaction}: UnknownTabProps) {
  const transactionData =
    transaction as Types.Transaction_BlockMetadataTransaction;

  return (
    <Box marginBottom={3}>
      <ContentBox padding={4}>
        <Alert severity="warning">{`Unknown transaction type: "${transaction.type}"`}</Alert>
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
      </ContentBox>
      <ContentBox>
        <TransactionBlockRow version={transactionData.version} />
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
        <ContentRow
          title="Full Transaction:"
          value={<JsonViewCard data={transaction} />}
        />
      </ContentBox>
    </Box>
  );
}
