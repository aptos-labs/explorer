import * as React from "react";
import {Types} from "aptos";
import {Stack, Box} from "@mui/material";
import {
  renderGas,
  renderSuccess,
  renderTimestamp,
} from "../../Transactions/helpers";
import Row from "./Components/Row";
import HashButton, {HashType} from "../../../components/HashButton";

type BlockMetadataOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function BlockMetadataOverviewTab({
  transaction,
}: BlockMetadataOverviewTabProps) {
  const transactionData =
    transaction as Types.Transaction_BlockMetadataTransaction;

  return (
    <Box marginX={2} marginTop={5}>
      <Stack direction="column" spacing={3}>
        <Row title={"ID:"} value={transactionData.id} />
        <Row title={"Version:"} value={transactionData.version} />
        <Row title={"Round:"} value={transactionData.round} />
        <Row title={"Status:"} value={renderSuccess(transactionData.success)} />
        <Row
          title={"Proposer:"}
          value={
            <HashButton
              hash={transactionData.proposer}
              type={HashType.ACCOUNT}
            />
          }
        />
        <Row
          title={"State Root Hash:"}
          value={transactionData.state_root_hash}
        />
        <Row
          title={"Event Root Hash:"}
          value={transactionData.event_root_hash}
        />
        <Row title={"Gas Used:"} value={renderGas(transactionData.gas_used)} />
        <Row title={"VM Status:"} value={transactionData.vm_status} />
        <Row
          title={"Accumulator Root Hash:"}
          value={transactionData.accumulator_root_hash}
        />
        <Row
          title={"Timestamp:"}
          value={renderTimestamp(transactionData.timestamp)}
        />
      </Stack>
    </Box>
  );
}
