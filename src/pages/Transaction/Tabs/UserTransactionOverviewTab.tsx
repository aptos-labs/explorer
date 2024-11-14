import * as React from "react";
import {Types} from "aptos";
import {Box} from "@mui/material";
import HashButton, {HashType} from "../../../components/HashButton";
import ContentBox from "../../../components/IndividualPageContent/ContentBox";
import ContentRow from "../../../components/IndividualPageContent/ContentRow";
import {TransactionStatus} from "../../../components/TransactionStatus";
import {getLearnMoreTooltip} from "../helpers";
import TimestampValue from "../../../components/IndividualPageContent/ContentValue/TimestampValue";
import {APTCurrencyValue} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import GasValue from "../../../components/IndividualPageContent/ContentValue/GasValue";
import GasFeeValue from "../../../components/IndividualPageContent/ContentValue/GasFeeValue";
import {getTransactionAmount, getTransactionCounterparty} from "../utils";
import TransactionFunction from "./Components/TransactionFunction";
import TransactionBlockRow from "./Components/TransactionBlockRow";
import JsonViewCard from "../../../components/IndividualPageContent/JsonViewCard";
import {parseExpirationTimestamp} from "../../utils";
import {TransactionActions} from "./Components/TransactionActions";
import {grey} from "../../../themes/colors/aptosColorPalette";
import {LearnMoreTooltip} from "../../../components/IndividualPageContent/LearnMoreTooltip";
import {useGetCoinList} from "../../../api/hooks/useGetCoinList";
import {findCoinData} from "./BalanceChangeTab";

function UserTransferOrInteractionRows({
  transaction,
}: {
  transaction: Types.Transaction;
}) {
  const counterparty = getTransactionCounterparty(transaction);
  let smartContractAddress: string | undefined;
  if (
    "payload" in transaction &&
    "function" in transaction.payload &&
    transaction.payload.function.includes("::")
  ) {
    smartContractAddress = transaction.payload.function.split("::")[0];
  }
  return (
    <>
      {counterparty && counterparty.role === "receiver" && (
        <ContentRow
          title="Receiver:"
          value={
            <HashButton hash={counterparty.address} type={HashType.ACCOUNT} />
          }
          tooltip={getLearnMoreTooltip("receiver")}
        />
      )}
      {smartContractAddress && (
        <ContentRow
          title="Smart Contract:"
          value={
            <HashButton hash={smartContractAddress} type={HashType.ACCOUNT} />
          }
          tooltip={getLearnMoreTooltip("smartContract")}
        />
      )}
    </>
  );
}

function TransactionFunctionRow({
  transaction,
}: {
  transaction: Types.Transaction;
}) {
  return (
    <ContentRow
      title="Function:"
      value={<TransactionFunction transaction={transaction} />}
      tooltip={getLearnMoreTooltip("function")}
    />
  );
}

function TransactionAmountRow({transaction}: {transaction: Types.Transaction}) {
  const amount = getTransactionAmount(transaction);

  return (
    <ContentRow
      title="Amount:"
      value={
        amount !== undefined ? (
          <APTCurrencyValue amount={amount.toString()} />
        ) : null
      }
      tooltip={getLearnMoreTooltip("amount")}
    />
  );
}

type Swap = {
  actionType: "swap";
  dex: string;
  amountIn: number;
  amountOut: number;
  assetIn: string;
  assetOut: string;
};

function TransactionActionsRow({
  transaction,
}: {
  transaction: Types.Transaction;
}) {
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];
  const actions = events.map(getEventAction).filter((a) => a !== undefined);

  const {data: coinData} = useGetCoinList();

  return (
    <ContentRow
      title="Actions:"
      value={actions.map(
        (action, i) =>
          action.actionType === "swap" &&
          (() => {
            const assetInCoin = findCoinData(
              coinData?.data ?? [],
              action.assetIn,
            );
            const assetOutCoin = findCoinData(
              coinData?.data ?? [],
              action.assetOut,
            );

            return (
              <Box
                key={`action-${i}`}
                sx={{
                  marginBottom: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                🔄 Swapped{" "}
                {action.amountIn / Math.pow(10, assetInCoin?.decimals ?? 0)}
                <HashButton
                  hash={action.assetIn}
                  type={
                    action.assetIn.includes("::")
                      ? HashType.COIN
                      : HashType.FUNGIBLE_ASSET
                  }
                  img={assetInCoin?.logoUrl}
                />
                for{" "}
                {action.amountOut / Math.pow(10, assetOutCoin?.decimals ?? 0)}
                <HashButton
                  hash={action.assetOut}
                  type={
                    action.assetOut.includes("::")
                      ? HashType.COIN
                      : HashType.FUNGIBLE_ASSET
                  }
                  img={assetOutCoin?.logoUrl}
                />
                on {action.dex}
              </Box>
            );
          })(),
      )}
      tooltip={
        <LearnMoreTooltip text="Community-curated interpretations of the transaction." />
      }
    />
  );
}

type UserTransactionOverviewTabProps = {
  transaction: Types.Transaction;
};

export default function UserTransactionOverviewTab({
  transaction,
}: UserTransactionOverviewTabProps) {
  const transactionData = transaction as Types.Transaction_UserTransaction;

  // TODO: pass into gas fee value to reduce searches
  const feeStatement = transactionData?.events?.find(
    (e) => e.type === "0x1::transaction_fee::FeeStatement",
  );
  let feePayer: string | undefined;
  if (
    transactionData?.signature &&
    "fee_payer_address" in transactionData.signature
  ) {
    feePayer = transactionData.signature.fee_payer_address;
  }

  let secondarySigners: string[] | undefined;
  if (
    transactionData?.signature &&
    "secondary_signer_addresses" in transactionData.signature
  ) {
    secondarySigners = transactionData.signature.secondary_signer_addresses;
  }

  return (
    <Box marginBottom={3}>
      <ContentBox padding={4}>
        <ContentRow
          title={"Version:"}
          value={<Box sx={{fontWeight: 600}}>{transactionData.version}</Box>}
          tooltip={getLearnMoreTooltip("version")}
        />
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
        {feePayer && (
          <ContentRow
            title="Fee Payer:"
            value={<HashButton hash={feePayer} type={HashType.ACCOUNT} />}
            tooltip={getLearnMoreTooltip("fee_payer")}
          />
        )}
        {secondarySigners && secondarySigners.length > 0 && (
          <ContentRow
            title="Secondary Signers:"
            value={secondarySigners.map((address) => (
              <HashButton hash={address} type={HashType.ACCOUNT} />
            ))}
            tooltip={getLearnMoreTooltip("secondary_signers")}
          />
        )}
        <UserTransferOrInteractionRows transaction={transactionData} />
        <TransactionFunctionRow transaction={transactionData} />
        <TransactionAmountRow transaction={transactionData} />
        <TransactionActionsRow transaction={transactionData} />
      </ContentBox>
      <ContentBox>
        <TransactionBlockRow version={transactionData.version} />
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
          title="Timestamp:"
          value={
            <TimestampValue
              timestamp={transactionData.timestamp}
              ensureMilliSeconds
            />
          }
          tooltip={getLearnMoreTooltip("timestamp")}
        />
        <ContentRow
          title="Gas Fee:"
          value={
            <GasFeeValue
              gasUsed={transactionData.gas_used}
              gasUnitPrice={transactionData.gas_unit_price}
              showGasUsed
              transactionData={transactionData}
            />
          }
          tooltip={getLearnMoreTooltip("gas_fee")}
        />
        {(feeStatement?.data?.storage_fee_refund_octas ?? 0) > 0 ? (
          <>
            <ContentRow
              title="Storage Refund:"
              value={
                <GasFeeValue
                  gasUsed={transactionData.gas_used}
                  gasUnitPrice={transactionData.gas_unit_price}
                  showGasUsed
                  transactionData={transactionData}
                  storageRefund={true}
                />
              }
              tooltip={getLearnMoreTooltip("storage_refund")}
            />
            <ContentRow
              title="Net Gas Changes:"
              value={
                <GasFeeValue
                  gasUsed={transactionData.gas_used}
                  gasUnitPrice={transactionData.gas_unit_price}
                  showGasUsed
                  transactionData={transactionData}
                  netGasCost
                />
              }
              tooltip={getLearnMoreTooltip("net_gas_fee")}
            />
          </>
        ) : null}
        <ContentRow
          title="Gas Unit Price:"
          value={
            <>
              <APTCurrencyValue amount={transactionData.gas_unit_price} />{" "}
              <span style={{color: grey[450]}}>
                ({transactionData.gas_unit_price} Octas)
              </span>
            </>
          }
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
          value={
            <JsonViewCard data={transactionData.signature} collapsedByDefault />
          }
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
      <TransactionActions transaction={transaction} />
    </Box>
  );
}

// we define parse<...>Event(event: Types.Event) -> string | undefined
// and getEventAction will simply go over the list of parse functions and return the first non-undefined result
function getEventAction(event: Types.Event): Swap | undefined {
  const parsers = [parseThalaSwapV1Event, parseThalaSwapV2Event];

  for (const parse of parsers) {
    const result = parse(event);
    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
}

function parseThalaSwapV1Event(event: Types.Event): Swap | undefined {
  if (
    !(
      event.type.startsWith(
        "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool::SwapEvent",
      ) ||
      event.type.startsWith(
        "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::stable_pool::SwapEvent",
      )
    )
  ) {
    return undefined;
  }

  const typeArgsMatch = event.type.match(/<(.+)>/);
  const typeArgs = typeArgsMatch
    ? typeArgsMatch[1].split(",").map((arg) => arg.trim())
    : [];
  const data: {
    amount_in: string;
    amount_out: string;
    idx_in: string;
    idx_out: string;
  } = event.data;
  const amountIn = Number(data.amount_in);
  const amountOut = Number(data.amount_out);
  const assetIn = typeArgs[Number(data.idx_in)];
  const assetOut = typeArgs[Number(data.idx_out)];

  return {
    actionType: "swap",
    dex: "ThalaSwap v1",
    amountIn,
    amountOut,
    assetIn,
    assetOut,
  };
}

function parseThalaSwapV2Event(event: Types.Event): Swap | undefined {
  if (
    event.type !==
    "0x7730cd28ee1cdc9e999336cbc430f99e7c44397c0aa77516f6f23a78559bb5::pool::SwapEvent"
  ) {
    return undefined;
  }

  const data: {
    amount_in: string;
    amount_out: string;
    idx_in: string;
    idx_out: string;
    metadata: {inner: string}[];
  } = event.data;
  const amountIn = Number(data.amount_in);
  const amountOut = Number(data.amount_out);
  const assetIn = data.metadata[Number(data.idx_in)].inner;
  const assetOut = data.metadata[Number(data.idx_out)].inner;

  return {
    actionType: "swap",
    dex: "ThalaSwap v2",
    amountIn,
    amountOut,
    assetIn,
    assetOut,
  };
}
