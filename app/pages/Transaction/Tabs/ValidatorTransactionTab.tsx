import {Box} from "@mui/material";
import type {Types} from "~/types/aptos";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import IntegerValue from "../../../components/IndividualPageContent/ContentValue/IntegerValue";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";
import TransactionBlockRow from "./Components/TransactionBlockRow";

type ValidatorTabProps = {
  transaction: Types.Transaction;
};

export default function ValidatorTransactionTab({
  transaction,
}: ValidatorTabProps) {
  // FIXME: We need to get off SDK v1
  // Validator transactions have additional properties beyond base Transaction type
  // Type assertion is needed until we migrate to SDK v2
  const transactionData = transaction as Types.Transaction & {
    validator_transaction_type?: string;
    success?: boolean;
    version?: string;
    timestamp?: string;
    vm_status?: string;
    state_change_hash?: string;
    event_root_hash?: string;
    accumulator_root_hash?: string;
  };

  return (
    <Box
      sx={{
        marginBottom: 3,
      }}
    >
      <ContentBox sx={{padding: 4}}>
        <ContentRow
          titleKey="fields.version"
          value={
            <Box sx={{fontWeight: 600}}>
              <IntegerValue value={transactionData.version} />
            </Box>
          }
          tooltip={getLearnMoreTooltip("version")}
        />
        <ContentRow
          titleKey="fields.status"
          value={
            <TransactionStatus success={transactionData.success ?? false} />
          }
          tooltip={getLearnMoreTooltip("status")}
        />
        <ContentRow
          titleKey="fields.validatorTxnType"
          value={transactionData.validator_transaction_type ?? "Unknown"}
          tooltip={getLearnMoreTooltip("proposer")}
        />
      </ContentBox>
      <ContentBox>
        <TransactionBlockRow
          version={transactionData.version ?? String(transaction)}
        />
        <ContentRow
          titleKey="fields.timestamp"
          value={
            <TimestampValue
              timestamp={transactionData.timestamp ?? ""}
              ensureMilliSeconds
            />
          }
          tooltip={getLearnMoreTooltip("timestamp")}
        />
        <ContentRow
          titleKey="fields.vmStatus"
          value={transactionData.vm_status ?? ""}
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
