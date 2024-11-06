import * as React from "react";
import {Box} from "@mui/material";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {getLearnMoreTooltip} from "../helpers";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {APTCurrencyValue} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GasValue from "../../../components/IndividualPageContent/ContentValue/GasValue";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {parseExpirationTimestamp} from "../../utils";
import {PendingTransactionResponse} from "@aptos-labs/wallet-adapter-react";
import {TransactionResponse} from "@aptos-labs/ts-sdk";

type PendingTransactionOverviewTabProps = {
  transaction: TransactionResponse;
};

export default function PendingTransactionOverviewTab({
  transaction,
}: PendingTransactionOverviewTabProps) {
  const transactionData = transaction as PendingTransactionResponse;

  return (
    <Box marginBottom={3}>
      <ContentBox>
        <ContentRow
          title="Sender:"
          value={
            <HashButton hash={transactionData.sender} type={HashType.ACCOUNT} />
          }
          tooltip={getLearnMoreTooltip("sender")}
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
              timestamp={parseExpirationTimestamp(
                transactionData.expiration_timestamp_secs,
              )}
              ensureMilliSeconds={false}
            />
          }
          tooltip={getLearnMoreTooltip("expiration_timestamp_secs")}
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
          title="Signature:"
          value={
            <JsonViewCard data={transactionData.signature} collapsedByDefault />
          }
          tooltip={getLearnMoreTooltip("signature")}
        />
      </ContentBox>
    </Box>
  );
}
