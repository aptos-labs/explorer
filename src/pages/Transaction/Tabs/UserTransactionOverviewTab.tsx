import * as React from "react";
import {Types} from "aptos";
import {Stack, Box} from "@mui/material";
import {renderDebug} from "../../utils";
import {
  renderGas,
  renderSuccess,
  renderTimestamp,
} from "../../Transactions/helpers";
import Row from "./Components/Row";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "./Components/ContentBox";
import ContentRow from "./Components/ContentRow";
import TransactionStatus from "../../../components/TransactionStatus";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";
import JsonCard from "../../../components/JsonCard";

type UserTransactionOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function UserTransactionOverviewTab({
  transaction,
}: UserTransactionOverviewTabProps) {
  const inDev = useGetInDevMode();
  const transactionData = transaction as Types.Transaction_UserTransaction;

  return inDev ? (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow
          title="Sender:"
          value={
            <HashButton hash={transactionData.sender} type={HashType.ACCOUNT} />
          }
        />
        <ContentRow
          title="Sequence Number:"
          value={transactionData.sequence_number}
        />
        <ContentRow
          title="Expiration Timestamp:"
          value={renderTimestamp(transactionData.expiration_timestamp_secs)}
        />
        <ContentRow title={"Version:"} value={transactionData.version} />
        <ContentRow
          title="Status:"
          value={<TransactionStatus success={transactionData.success} />}
        />
        <ContentRow
          title="State Root Hash:"
          value={transactionData.state_root_hash}
        />
        <ContentRow
          title="Event Root Hash:"
          value={transactionData.event_root_hash}
        />
        <ContentRow
          title="Gas Used:"
          value={renderGas(transactionData.gas_used)}
        />
        <ContentRow
          title="Max Gas:"
          value={renderGas(transactionData.max_gas_amount)}
        />
        <ContentRow
          title="Gas Unit Price:"
          value={renderGas(transactionData.gas_unit_price)}
        />
        <ContentRow title="VM Status:" value={transactionData.vm_status} />
      </ContentBox>
      <ContentBox>
        <ContentRow
          title="Signature:"
          value={<JsonCard data={transactionData.signature} />}
        />
        <ContentRow
          title="Accumulator Root Hash:"
          value={transactionData.accumulator_root_hash}
        />
        <ContentRow title="Timestamp:" value={transactionData.timestamp} />
      </ContentBox>
    </Box>
  ) : (
    <Box marginX={2} marginTop={5}>
      <Stack direction="column" spacing={3}>
        <Row
          title={"Sender:"}
          value={
            <HashButton hash={transactionData.sender} type={HashType.ACCOUNT} />
          }
        />
        <Row
          title={"Sequence Number:"}
          value={transactionData.sequence_number}
        />
        <Row
          title={"Expiration Timestamp:"}
          value={renderTimestamp(transactionData.expiration_timestamp_secs)}
        />
        <Row title={"Version:"} value={transactionData.version} />
        <Row title={"Status:"} value={renderSuccess(transactionData.success)} />
        <Row
          title={"State Root Hash:"}
          value={transactionData.state_root_hash}
        />
        <Row
          title={"Event Root Hash:"}
          value={transactionData.event_root_hash}
        />
        <Row title={"Gas Used:"} value={renderGas(transactionData.gas_used)} />
        <Row
          title={"Max Gas:"}
          value={renderGas(transactionData.max_gas_amount)}
        />
        <Row
          title={"Gas Unit Price:"}
          value={renderGas(transactionData.gas_unit_price)}
        />
        <Row title={"VM Status:"} value={transactionData.vm_status} />
        <Row
          title={"Signature:"}
          value={renderDebug(transactionData.signature)}
        />
        <Row
          title={"Accumulator Root Hash:"}
          value={transactionData.accumulator_root_hash}
        />
        <Row title={"Timestamp:"} value={transactionData.timestamp} />
      </Stack>
    </Box>
  );
}
