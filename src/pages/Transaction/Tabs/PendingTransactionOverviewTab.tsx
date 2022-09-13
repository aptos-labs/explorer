import * as React from "react";
import {Types} from "aptos";
import {Stack, Box} from "@mui/material";
import {renderGas, renderTimestamp} from "../../Transactions/helpers";
import Row from "./Components/Row";
import HashButton, {HashType} from "../../../components/HashButton";
import {renderDebug} from "../../utils";
import ContentBox from "./Components/ContentBox";
import ContentRow from "./Components/ContentRow";
import {useGetInDevMode} from "../../../api/hooks/useGetInDevMode";

type PendingTransactionOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function PendingTransactionOverviewTab({
  transaction,
}: PendingTransactionOverviewTabProps) {
  const inDev = useGetInDevMode();
  const transactionData = transaction as Types.Transaction_PendingTransaction;

  return inDev ? (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow
          title={"Sender:"}
          value={
            <HashButton hash={transactionData.sender} type={HashType.ACCOUNT} />
          }
        />
        <ContentRow
          title={"Sequence Number:"}
          value={transactionData.sequence_number}
        />
        <ContentRow
          title={"Expiration Timestamp:"}
          value={renderTimestamp(transactionData.expiration_timestamp_secs)}
        />
        <ContentRow
          title={"Max Gas:"}
          value={renderGas(transactionData.max_gas_amount)}
        />
        <ContentRow
          title={"Gas Unit Price:"}
          value={renderGas(transactionData.gas_unit_price)}
        />
        <ContentRow
          title={"Signature:"}
          value={renderDebug(transactionData.signature)}
        />
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
