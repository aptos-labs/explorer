import * as React from "react";
import {Types} from "aptos";
import {Stack, Box} from "@mui/material";
import Row from "./Components/Row";
import HashButton, {HashType} from "../../../components/HashButton";
import {getFormattedTimestamp, renderDebug} from "../../utils";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {useGetInGtmMode} from "../../../api/hooks/useGetInDevMode";
import {getLearnMoreTooltip} from "../helpers";
import JsonCard from "../../../components/IndividualPageContent/JsonCard";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {APTCurrencyValue} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GasValue from "../../../components/IndividualPageContent/ContentValue/GasValue";

type PendingTransactionOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function PendingTransactionOverviewTab({
  transaction,
}: PendingTransactionOverviewTabProps) {
  const inGtm = useGetInGtmMode();
  const transactionData = transaction as Types.Transaction_PendingTransaction;

  return inGtm ? (
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
              timestamp={transactionData.expiration_timestamp_secs}
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
          value={<JsonCard data={transactionData.signature} />}
          tooltip={getLearnMoreTooltip("signature")}
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
          value={getFormattedTimestamp(
            transactionData.expiration_timestamp_secs,
          )}
        />
        <Row
          title={"Max Gas Limit:"}
          value={<GasValue gas={transactionData.max_gas_amount} />}
        />
        <Row
          title={"Gas Unit Price:"}
          value={<APTCurrencyValue amount={transactionData.gas_unit_price} />}
        />
        <Row
          title={"Signature:"}
          value={renderDebug(transactionData.signature)}
        />
      </Stack>
    </Box>
  );
}
