import * as React from "react";
import {Types} from "aptos";
import {Box} from "@mui/material";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {TransactionStatus} from "../../../components/TransactionStatus";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import {getLearnMoreTooltip} from "../helpers";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {APTCurrencyValue} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GasValue from "../../../components/IndividualPageContent/ContentValue/GasValue";
import GasFeeValue from "../../../components/IndividualPageContent/ContentValue/GasFeeValue";

function UserTransferRows({transaction}: {transaction: Types.Transaction}) {
  if (!("payload" in transaction)) {
    return null;
  }

  if (transaction.payload.type !== "entry_function_payload") {
    return null;
  }

  // there are two scenarios that this transaction is an APT coin transfer:
  // 1. coins are transferred from account1 to account2:
  //    payload function is "0x1::coin::transfer" and the first item in type_arguments is "0x1::aptos_coin::AptosCoin"
  // 2. coins are transferred from account1 to account2, and account2 is created upon transaction:
  //    payload function is "0x1::aptos_account::transfer"
  // In both scenarios, the first item in arguments is the receiver's address, and the second item is the amount.

  const payload =
    transaction.payload as Types.TransactionPayload_EntryFunctionPayload;
  const typeArgument =
    payload.type_arguments.length > 0 ? payload.type_arguments[0] : undefined;
  const isAptCoinTransfer =
    payload.function === "0x1::coin::transfer" &&
    typeArgument === "0x1::aptos_coin::AptosCoin";
  const isAptCoinInitialTransfer =
    payload.function === "0x1::aptos_account::transfer";

  if (!isAptCoinTransfer && !isAptCoinInitialTransfer) {
    return null;
  }

  if (payload.arguments.length < 2) {
    return null;
  }

  return (
    <>
      <ContentRow
        title="Receiver:"
        value={
          <HashButton hash={payload.arguments[0]} type={HashType.ACCOUNT} />
        }
        tooltip={getLearnMoreTooltip("receiver")}
      />
      <ContentRow
        title="Amount:"
        value={<APTCurrencyValue amount={payload.arguments[1]} />}
        tooltip={getLearnMoreTooltip("amount")}
      />
    </>
  );
}

type UserTransactionOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function UserTransactionOverviewTab({
  transaction,
}: UserTransactionOverviewTabProps) {
  const transactionData = transaction as Types.Transaction_UserTransaction;

  return (
    <Box marginBottom={3}>
      <ContentBox padding={4}>
        <ContentRow
          title="Status:"
          value={<TransactionStatus success={transactionData.success} />}
          tooltip={getLearnMoreTooltip("status")}
        />
        <ContentRow
          title="Sender:"
          value={
            <HashButton hash={transactionData.sender} type={HashType.ACCOUNT} />
          }
          tooltip={getLearnMoreTooltip("sender")}
        />
        <UserTransferRows transaction={transactionData} />
        <ContentRow
          title={"Version:"}
          value={transactionData.version}
          tooltip={getLearnMoreTooltip("version")}
        />
        <ContentRow
          title="Sequence Number:"
          value={transactionData.sequence_number}
          tooltip={getLearnMoreTooltip("sequence_number")}
        />
        <ContentRow
          title="Expiration Timestamp:"
          value={
            <TimestampValue
              timestamp={transactionData.expiration_timestamp_secs}
            />
          }
          tooltip={getLearnMoreTooltip("expiration_timestamp_secs")}
        />
        <ContentRow
          title="Timestamp:"
          value={<TimestampValue timestamp={transactionData.timestamp} />}
          tooltip={getLearnMoreTooltip("timestamp")}
        />
        <ContentRow
          title="Gas Fee:"
          value={
            <GasFeeValue
              gasUsed={transactionData.gas_used}
              gasUnitPrice={transactionData.gas_unit_price}
              showGasUsed
            />
          }
          tooltip={getLearnMoreTooltip("gas_fee")}
        />
        <ContentRow
          title="Gas Unit Price:"
          value={<APTCurrencyValue amount={transactionData.gas_unit_price} />}
          tooltip={getLearnMoreTooltip("gas_unit_price")}
        />
        <ContentRow
          title="Max Gas Limit:"
          value={<GasValue gas={transactionData.max_gas_amount} />}
          tooltip={getLearnMoreTooltip("max_gas_amount")}
        />
        <ContentRow
          title="VM Status:"
          value={transactionData.vm_status}
          tooltip={getLearnMoreTooltip("vm_status")}
        />
      </ContentBox>
      <ContentBox>
        <ContentRow
          title="Signature:"
          value={<JsonCard data={transactionData.signature} />}
          tooltip={getLearnMoreTooltip("signature")}
        />
        <ContentRow
          title="State Change Hash:"
          value={transactionData.state_change_hash}
          tooltip={getLearnMoreTooltip("state_change_hash")}
        />
        <ContentRow
          title="Event Root Hash:"
          value={transactionData.event_root_hash}
          tooltip={getLearnMoreTooltip("event_root_hash")}
        />
        <ContentRow
          title="Accumulator Root Hash:"
          value={transactionData.accumulator_root_hash}
          tooltip={getLearnMoreTooltip("accumulator_root_hash")}
        />
      </ContentBox>
    </Box>
  );
}
