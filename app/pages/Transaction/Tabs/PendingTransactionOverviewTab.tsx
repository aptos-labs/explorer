import {Box} from "@mui/material";
import type {Types} from "~/types/aptos";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {APTCurrencyValue} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GasValue from "../../../components/IndividualPageContent/ContentValue/GasValue";
import IntegerValue from "../../../components/IndividualPageContent/ContentValue/IntegerValue";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {parseExpirationTimestamp} from "../../utils";
import {getLearnMoreTooltip} from "../helpers";
import SignatureOverviewTable from "./Components/SignatureOverviewTable";

type PendingTransactionOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function PendingTransactionOverviewTab({
  transaction,
}: PendingTransactionOverviewTabProps) {
  const transactionData = transaction as Types.Transaction_PendingTransaction;

  return (
    <Box
      sx={{
        marginBottom: 3,
      }}
    >
      <ContentBox>
        <ContentRow
          titleKey="fields.sender"
          value={
            <HashButton hash={transactionData.sender} type={HashType.ACCOUNT} />
          }
          tooltip={getLearnMoreTooltip("sender")}
        />
        <ContentRow
          titleKey="fields.sequenceNumber"
          value={<IntegerValue value={transactionData.sequence_number} />}
          tooltip={getLearnMoreTooltip("sequence_number")}
        />
        <ContentRow
          titleKey="fields.expirationTimestamp"
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
          titleKey="fields.gasUnitPrice"
          value={<APTCurrencyValue amount={transactionData.gas_unit_price} />}
          tooltip={getLearnMoreTooltip("gas_unit_price")}
        />
        <ContentRow
          titleKey="fields.maxGasLimit"
          value={<GasValue gas={transactionData.max_gas_amount} />}
          tooltip={getLearnMoreTooltip("max_gas_amount")}
        />
        <ContentRow
          titleKey="fields.signature"
          value={
            <SignatureOverviewTable signature={transactionData.signature} />
          }
          tooltip={getLearnMoreTooltip("signature")}
        />
      </ContentBox>
    </Box>
  );
}
