import {Box} from "@mui/material";
import type {Types} from "~/types/aptos";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";
import TransactionBlockRow from "./Components/TransactionBlockRow";

type StateCheckpointOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function StateCheckpointOverviewTab({
  transaction,
}: StateCheckpointOverviewTabProps) {
  const transactionData =
    transaction as Types.Transaction_StateCheckpointTransaction;

  return (
    <Box
      sx={{
        marginBottom: 3,
      }}
    >
      <ContentBox>
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
        <TransactionBlockRow version={transactionData.version} />
        {"timestamp" in transactionData && (
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
        )}
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
