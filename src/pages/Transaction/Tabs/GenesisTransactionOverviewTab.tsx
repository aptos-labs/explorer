import * as React from "react";
import {Types} from "aptos";
import {Box} from "@mui/material";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";

type GenesisTransactionOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function GenesisTransactionOverviewTab({
  transaction,
}: GenesisTransactionOverviewTabProps) {
  const transactionData = transaction as Types.Transaction_GenesisTransaction;

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
