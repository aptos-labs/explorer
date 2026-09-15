import {Box} from "@mui/material";
import type {Types} from "~/types/aptos";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";
import TransactionBlockRow from "./Components/TransactionBlockRow";

type BlockEpilogueOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function BlockEpilogueOverviewTab({
  transaction,
}: BlockEpilogueOverviewTabProps) {
  interface TransactionData {
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
  }

  const transactionData: TransactionData = transaction as TransactionData;
  return (
    <Box
      sx={{
        marginBottom: 3,
      }}
    >
      <ContentBox sx={{padding: 4}}>
        <ContentRow
          titleKey="fields.version"
          value={<Box sx={{fontWeight: 600}}>{transactionData.version}</Box>}
          tooltip={getLearnMoreTooltip("version")}
        />
        <ContentRow
          titleKey="fields.status"
          value={<TransactionStatus success={transactionData.success} />}
          tooltip={getLearnMoreTooltip("status")}
        />
      </ContentBox>
      <ContentBox>
        <TransactionBlockRow version={transactionData.version} />
        <ContentRow
          titleKey="fields.blockGasLimitReached"
          value={
            transactionData.block_end_info.block_gas_limit_reached
              ? "Yes"
              : "No"
          }
          tooltip={getLearnMoreTooltip("block_gas_limit_reached")}
        />
        <ContentRow
          titleKey="fields.blockOutputLimitReached"
          value={
            transactionData.block_end_info.block_output_limit_reached
              ? "Yes"
              : "No"
          }
          tooltip={getLearnMoreTooltip("block_output_limit_reached")}
        />
        <ContentRow
          titleKey="fields.blockApproximateOutputSize"
          value={transactionData.block_end_info.block_approx_output_size}
          tooltip={getLearnMoreTooltip("block_approx_output_size")}
        />
        <ContentRow
          titleKey="fields.blockEffectiveGasUnits"
          value={transactionData.block_end_info.block_effective_block_gas_units}
          tooltip={getLearnMoreTooltip("block_effective_block_gas_units")}
        />
        <ContentRow
          titleKey="fields.timestamp"
          value={
            <TimestampValue
              timestamp={transactionData.timestamp}
              ensureMilliSeconds
            />
          }
          tooltip={getLearnMoreTooltip("timestamp")}
        />
        <ContentRow
          titleKey="fields.vmStatus"
          value={transactionData.vm_status}
          tooltip={getLearnMoreTooltip("vm_status")}
        />
      </ContentBox>
      <ContentBox>
        <ContentRow
          titleKey="fields.stateChangeHash"
          value={transactionData.state_change_hash}
          tooltip={getLearnMoreTooltip("state_change_hash")}
        />
        <ContentRow
          titleKey="fields.eventRootHash"
          value={transactionData.event_root_hash}
          tooltip={getLearnMoreTooltip("event_root_hash")}
        />
        <ContentRow
          titleKey="fields.accumulatorRootHash"
          value={transactionData.accumulator_root_hash}
          tooltip={getLearnMoreTooltip("accumulator_root_hash")}
        />
      </ContentBox>
    </Box>
  );
}
