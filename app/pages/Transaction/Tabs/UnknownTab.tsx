import {Alert, Box} from "@mui/material";
import type {Types} from "~/types/aptos";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";
import TransactionBlockRow from "./Components/TransactionBlockRow";

type UnknownTabProps = {
  transaction: Types.Transaction;
};

export default function UnknownTab({transaction}: UnknownTabProps) {
  const transactionData =
    transaction as Types.Transaction_BlockMetadataTransaction;

  return (
    <Box
      sx={{
        marginBottom: 3,
      }}
    >
      <ContentBox sx={{padding: 4}}>
        <Alert severity="warning">{`Unknown transaction type: "${transaction.type}"`}</Alert>
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
        <ContentRow
          titleKey="fields.fullTransaction"
          value={<JsonViewCard data={transaction} />}
        />
      </ContentBox>
    </Box>
  );
}
