import * as React from "react";
import {Types} from "aptos";
import {Box} from "@mui/material";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import TransactionBlockRow from "./Components/TransactionBlockRow";

type BlockEpilogueOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function BlockEpilogueOverviewTab({
  transaction,
}: BlockEpilogueOverviewTabProps) {
  const transactionData = // TODO: Get off SDK V1
    transaction as unknown as {
      version: string;
      hash: string;
      state_change_hash: string;
      event_root_hash: string;
      accumulator_root_hash: string;
      state_checkpoint_hash: string;
      gas_used: string;
      success: boolean;
      vm_status: string;
      timestamp: string;
      type: string;
      changes: Array<Types.WriteSetChange>;
      block_end_info: {
        block_gas_limit_reached: boolean;
        block_output_limit_reached: boolean;
        block_effective_block_gas_units: number;
        block_approx_output_size: number;
      };
    };

  return (
    <Box marginBottom={3}>
      <ContentBox padding={4}>
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
          title="Block gas limit reached:"
          value={
            transactionData.block_end_info.block_gas_limit_reached
              ? "Yes"
              : "No"
          }
          tooltip={getLearnMoreTooltip("block_gas_limit_reached")}
        />
        <ContentRow
          title="Block output limit reached:"
          value={
            transactionData.block_end_info.block_output_limit_reached
              ? "Yes"
              : "No"
          }
          tooltip={getLearnMoreTooltip("block_output_limit_reached")}
        />
        <ContentRow
          title="Block approximate output size:"
          value={transactionData.block_end_info.block_approx_output_size}
          tooltip={getLearnMoreTooltip("block_approx_output_size")}
        />
        <ContentRow
          title="Block effective gas units:"
          value={transactionData.block_end_info.block_effective_block_gas_units}
          tooltip={getLearnMoreTooltip("block_effective_block_gas_units")}
        />
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
      </ContentBox>
    </Box>
  );
}
