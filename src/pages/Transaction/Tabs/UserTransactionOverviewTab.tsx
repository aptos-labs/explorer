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

type UserTransactionOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function UserTransactionOverviewTab({
  transaction,
}: UserTransactionOverviewTabProps) {
  const transactionData = transaction as Types.Transaction_UserTransaction;

  return (
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
