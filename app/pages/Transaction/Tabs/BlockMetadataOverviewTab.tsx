import {Box} from "@mui/material";
import type {Types} from "~/types/aptos";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";
import TransactionBlockRow from "./Components/TransactionBlockRow";

type BlockMetadataOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function BlockMetadataOverviewTab({
  transaction,
}: BlockMetadataOverviewTabProps) {
  const transactionData =
    transaction as Types.Transaction_BlockMetadataTransaction;

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
        <ContentRow
          titleKey="fields.proposer"
          value={
            <HashButton
              hash={transactionData.proposer}
              type={HashType.ACCOUNT}
            />
          }
          tooltip={getLearnMoreTooltip("proposer")}
        />
        <ContentRow
          titleKey="fields.id"
          value={transactionData.id}
          tooltip={getLearnMoreTooltip("id")}
        />
      </ContentBox>
      <ContentBox>
        <TransactionBlockRow version={transactionData.version} />
        <ContentRow
          titleKey="fields.epoch"
          value={transactionData.epoch}
          tooltip={getLearnMoreTooltip("epoch")}
        />
        <ContentRow
          titleKey="fields.round"
          value={transactionData.round}
          tooltip={getLearnMoreTooltip("round")}
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
