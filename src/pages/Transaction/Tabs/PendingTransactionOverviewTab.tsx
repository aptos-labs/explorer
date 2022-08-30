import * as React from "react";
import {Types} from "aptos";
import {Stack, Box} from "@mui/material";
import {renderGas, renderTimestamp} from "../../Transactions/helpers";
import Row from "./Components/Row";
import HashButton, {HashType} from "../../../components/HashButton";
import {renderDebug} from "../../utils";

type PendingTransactionOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function PendingTransactionOverviewTab({
  transaction,
}: PendingTransactionOverviewTabProps) {
  const transactionData = transaction as Types.Transaction_PendingTransaction;

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
        <Row
          title={"Max Gas:"}
          value={renderGas(transactionData.max_gas_amount)}
        />
        <Row
          title={"Gas Unit Price:"}
          value={renderGas(transactionData.gas_unit_price)}
        />
        <Row
          title={"Signature:"}
          value={renderDebug(transactionData.signature)}
        />
      </Stack>
    </Box>
  );
}
