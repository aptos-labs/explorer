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
import {grey} from "../../../themes/colors/aptosColorPalette";
import {LearnMoreTooltip} from "../../../components/IndividualPageContent/LearnMoreTooltip";
import {
  CoinDescription,
  useGetCoinList,
} from "../../../api/hooks/useGetCoinList";
import {findCoinData} from "./BalanceChangeTab";
import {useGetAssetMetadata} from "../../../api/hooks/useGetAssetMetadata";
import {Hex} from "@aptos-labs/ts-sdk";

type EconiaState = {
  orderID: string | undefined;
  placeSwapOrder: Types.Event | undefined;
  fills: Types.Event[];
  hasCancelOrder: boolean;
};

// Fetched from https://aptos-mainnet-econia.nodeinfra.com/markets
// Update this once econia adds more markets
const ECONIA_MARKETS = [
  {
    market_id: 7,
    base_account_address: "0x1",
    base_module_name: "aptos_coin",
    base_struct_name: "AptosCoin",
    quote_account_address:
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa",
    quote_module_name: "asset",
    quote_struct_name: "USDC",
    tick_size: 1,
    lot_size: 100000,
  },
  {
    market_id: 8,
    base_account_address:
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa",
    base_module_name: "asset",
    base_struct_name: "WETH",
    quote_account_address:
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa",
    quote_module_name: "asset",
    quote_struct_name: "USDC",
    tick_size: 1,
    lot_size: 100,
  },
  {
    market_id: 12,
    base_account_address:
      "0x5e975e7f36f2658d4cf146142899c659464a3e0d90f0f4d5f8b2447173c06ef6",
    base_module_name: "EDOG",
    base_struct_name: "EDOG",
    quote_account_address: "0x1",
    quote_module_name: "aptos_coin",
    quote_struct_name: "AptosCoin",
    tick_size: 1,
    lot_size: 1000000,
  },
  {
    market_id: 2,
    base_account_address:
      "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea",
    base_module_name: "coin",
    base_struct_name: "T",
    quote_account_address: "0x1",
    quote_module_name: "aptos_coin",
    quote_struct_name: "AptosCoin",
    tick_size: 2,
    lot_size: 2,
  },
  {
    market_id: 3,
    base_account_address:
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa",
    base_module_name: "asset",
    base_struct_name: "USDC",
    quote_account_address: "0x1",
    quote_module_name: "aptos_coin",
    quote_struct_name: "AptosCoin",
    tick_size: 1,
    lot_size: 100,
  },
  {
    market_id: 9,
    base_account_address:
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa",
    base_module_name: "asset",
    base_struct_name: "USDT",
    quote_account_address:
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa",
    quote_module_name: "asset",
    quote_struct_name: "USDC",
    tick_size: 10,
    lot_size: 1000000,
  },
  {
    market_id: 6,
    base_account_address: "0x1",
    base_module_name: "aptos_coin",
    base_struct_name: "AptosCoin",
    quote_account_address:
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa",
    quote_module_name: "asset",
    quote_struct_name: "USDT",
    tick_size: 1,
    lot_size: 100,
  },
  {
    market_id: 5,
    base_account_address: "0x1",
    base_module_name: "aptos_coin",
    base_struct_name: "AptosCoin",
    quote_account_address:
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa",
    quote_module_name: "asset",
    quote_struct_name: "USDT",
    tick_size: 100,
    lot_size: 1,
  },
  {
    market_id: 1,
    base_account_address:
      "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea",
    base_module_name: "coin",
    base_struct_name: "T",
    quote_account_address: "0x1",
    quote_module_name: "aptos_coin",
    quote_struct_name: "AptosCoin",
    tick_size: 1,
    lot_size: 1,
  },
  {
    market_id: 4,
    base_account_address:
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa",
    base_module_name: "asset",
    base_struct_name: "USDC",
    quote_account_address: "0x1",
    quote_module_name: "aptos_coin",
    quote_struct_name: "AptosCoin",
    tick_size: 10,
    lot_size: 1000,
  },
  {
    market_id: 10,
    base_account_address:
      "0xe4ccb6d39136469f376242c31b34d10515c8eaaa38092f804db8e08a8f53c5b2",
    base_module_name: "assets_v1",
    base_struct_name: "EchoCoin002",
    quote_account_address:
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa",
    quote_module_name: "asset",
    quote_struct_name: "USDT",
    tick_size: 1,
    lot_size: 1000000000,
  },
  {
    market_id: 11,
    base_account_address:
      "0xe4ccb6d39136469f376242c31b34d10515c8eaaa38092f804db8e08a8f53c5b2",
    base_module_name: "assets_v1",
    base_struct_name: "EchoCoin002",
    quote_account_address: "0x1",
    quote_module_name: "aptos_coin",
    quote_struct_name: "AptosCoin",
    tick_size: 1,
    lot_size: 1000000000,
  },
];

const ECONIA_CONTRACT =
  "0xc0deb00c405f84c85dc13442e305df75d1288100cdd82675695f6148c7ece51c";

const TEXT_DECODER = new TextDecoder();

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

type EventAction = Swap | TokenMint | TokenBurn | ObjectTransfer;

type Swap = {
  actionType: "swap";
  dex:
    | "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af" // "ThalaSwap v1"
    | "0x007730cd28ee1cdc9e999336cbc430f99e7c44397c0aa77516f6f23a78559bb5" // "ThalaSwap v2"
    | "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12" // "Liquidswap v0"
    | "0x163df34fccbf003ce219d3f1d9e70d140b60622cb9dd47599c25fb2f797ba6e" // "Liquidswap v0.5"
    | "0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa" // "PancakeSwap"
    | "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c" // "SushiSwap"
    | "0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c" // "AnimeSwap"
    | "0xc7ea756470f72ae761b7986e4ed6fd409aad183b1b2d3d2f674d979852f45c4b" // "Obric"
    | "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541" // "Aux Exchange"
    | "0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1" // "Cellana Finance"
    | "0xc727553dd5019c4887581f0a89dca9c8ea400116d70e9da7164897812c6646e" // "Thetis Market"
    | "0xec42a352cc65eca17a9fa85d0fc602295897ed6b8b8af6a6c79ef490eb8f9eba" // "Cetus 1"
    | "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c" // "Hyperion"
    | "0xc0deb00c405f84c85dc13442e305df75d1288100cdd82675695f6148c7ece51c"; // "Econia"
  amountIn: number;
  amountOut: number;
  assetIn: string;
  assetOut: string;
};

type TokenMint = {
  actionType: "token mint";
  collection_address: string;
  token_address: string;
};
type TokenBurn = {
  actionType: "token burn";
  previous_owner: string;
  collection_address: string;
  token_address: string;
};

type ObjectTransfer = {
  actionType: "object transfer";
  address: string;
  from: string;
  to: string;
};

const parsers = [
  parseTokenMintEvent,
  parseTokenBurnEvent,
  parseObjectTransferEvent,

  // swap actions
  parseThalaSwapV1Event,
  parseThalaSwapV2Event,
  (event: Types.Event) =>
    parseLiquidswapV0Event(
      event,
      "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12", // Liquidswap v0
    ),
  (event: Types.Event) =>
    parseLiquidswapV0Event(
      event,
      "0x163df34fccbf003ce219d3f1d9e70d140b60622cb9dd47599c25fb2f797ba6e", // Liquidswap v0.5
    ),
  (event: Types.Event) =>
    parseBasicSwapEvent(
      event,
      "0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa", // PancakeSwap
    ),
  (event: Types.Event) =>
    parseBasicSwapEvent(
      event,
      "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c", // SushiSwap
    ),
  (event: Types.Event) =>
    parseBasicSwapEvent(
      event,
      "0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c", // AnimeSwap
    ),
  parseOrbicSwapEvent,
  parseAuxEvent,
  parseCellanaEvent,
  parseThetisSwapEvent,
  parseCetusSwapEvent,
  parseHyperionSwapEvent,
];

function TransactionActionsRow({
  transaction,
}: {
  transaction: Types.Transaction;
}) {
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];

  const actions: EventAction[] = [];
  const econiaState: EconiaState = {
    orderID: undefined,
    placeSwapOrder: undefined,
    hasCancelOrder: false,
    fills: [],
  };

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // Try single-event parsers first
    for (const parse of parsers) {
      const result = parse(event);
      if (result) {
        actions.push(result);
      }
    }

    // Try Econia parser
    if (event.type.startsWith(ECONIA_CONTRACT)) {
      const ready =
        i === events.length - 1 ||
        !events[i + 1].type.startsWith(ECONIA_CONTRACT) ||
        events[i + 1].type !== `${ECONIA_CONTRACT}::user::FillEvent`;
      const econiaResult = parseEconiaEvent(event, econiaState, ready);
      if (econiaResult) {
        actions.push(econiaResult);

        // Reset Econia state
        econiaState.orderID = undefined;
        econiaState.placeSwapOrder = undefined;
        econiaState.hasCancelOrder = false;
        econiaState.fills = [];
      }
    }
  }

  const {data: coinData} = useGetCoinList();

  return (
    <ContentRow
      title="Actions:"
      value={actions.map((action, i) => {
        switch (action.actionType) {
          case "swap":
            return swapAction(coinData, action, i);
          case "token mint":
            return nftMintAction(action, i);
          case "token burn":
            return nftBurnAction(action, i);
          case "object transfer":
            return objectTransferAction(action, i);
        }
      })}
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
    </Box>
  );
}

const SwapActionContent = ({
  action,
  coinData,
}: {
  action: Swap;
  coinData: {data: CoinDescription[]} | undefined;
}) => {
  const {data: assetInMetadata} = useGetAssetMetadata(action.assetIn);
  const {data: assetOutMetadata} = useGetAssetMetadata(action.assetOut);

  // Try coinData first
  const assetInCoin = findCoinData(coinData?.data ?? [], action.assetIn);
  const assetOutCoin = findCoinData(coinData?.data ?? [], action.assetOut);

  // Use coinData decimals if available, otherwise fall back to metadata, then default to 0
  const inDecimals = assetInCoin?.decimals ?? assetInMetadata?.decimals ?? 0;
  const outDecimals = assetOutCoin?.decimals ?? assetOutMetadata?.decimals ?? 0;

  return (
    <Box
      sx={{
        marginBottom: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {"🔄 Swapped "}
      {action.amountIn / Math.pow(10, inDecimals)}
      <HashButton
        hash={action.assetIn}
        type={
          action.assetIn.includes("::")
            ? HashType.COIN
            : HashType.FUNGIBLE_ASSET
        }
        img={assetInCoin?.logoUrl}
        size="small"
      />
      for {action.amountOut / Math.pow(10, outDecimals)}
      <HashButton
        hash={action.assetOut}
        type={
          action.assetOut.includes("::")
            ? HashType.COIN
            : HashType.FUNGIBLE_ASSET
        }
        img={assetOutCoin?.logoUrl}
        size="small"
      />
      on <HashButton hash={action.dex} type={HashType.ACCOUNT} />
    </Box>
  );
};

const swapAction = (
  coinData: {data: CoinDescription[]} | undefined,
  action: Swap,
  i: number,
) => {
  return (
    <SwapActionContent
      key={`action-${i}`}
      action={action}
      coinData={coinData}
    />
  );
};

const nftMintAction = (action: TokenMint, i: number) => {
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
      {"🏗️ Minted "}
      {<HashButton hash={action.token_address} type={HashType.OBJECT} />}
      {" in collection "}
      {<HashButton hash={action.collection_address} type={HashType.OBJECT} />}
    </Box>
  );
};

const nftBurnAction = (action: TokenBurn, i: number) => {
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
      {"🔥️ Burned "}
      {<HashButton hash={action.token_address} type={HashType.OBJECT} />}
      {" in collection "}
      {<HashButton hash={action.collection_address} type={HashType.OBJECT} />}
      {" from "}
      {<HashButton hash={action.previous_owner} type={HashType.ACCOUNT} />}
    </Box>
  );
};

const objectTransferAction = (action: ObjectTransfer, i: number) => {
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
      {"⏩ Transferred "}
      {<HashButton hash={action.address} type={HashType.OBJECT} />} {" from "}
      {<HashButton hash={action.from} type={HashType.ACCOUNT} />} {" to "}
      {<HashButton hash={action.to} type={HashType.ACCOUNT} />}
    </Box>
  );
};

function parseTokenMintEvent(event: Types.Event): TokenMint | undefined {
  if (
    !event.type.startsWith("0x4::collection::Mint") &&
    !event.type.startsWith("0x4::collection::MintEvent")
  ) {
    return undefined;
  }

  const data: {
    collection: string;
    token: string;
  } = event.data;

  return {
    actionType: "token mint",
    collection_address: data.collection,
    token_address: data.token,
  };
}

function parseTokenBurnEvent(event: Types.Event): TokenBurn | undefined {
  if (
    !event.type.startsWith("0x4::collection::Burn") &&
    !event.type.startsWith("0x4::collection::BurnEvent")
  ) {
    return undefined;
  }

  const data: {
    collection: string;
    token: string;
    previous_owner: string;
  } = event.data;

  return {
    actionType: "token burn",
    collection_address: data.collection,
    token_address: data.token,
    previous_owner: data.previous_owner,
  };
}

function parseObjectTransferEvent(
  event: Types.Event,
): ObjectTransfer | undefined {
  if (
    !event.type.startsWith("0x1::object::Transfer") &&
    !event.type.startsWith("0x1::object::TransferEvent")
  ) {
    return undefined;
  }

  const data: {
    from: string;
    to: string;
    object: string;
  } = event.data;

  return {
    actionType: "object transfer",
    from: data.from,
    to: data.to,
    address: data.object,
  };
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
    dex: "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af",
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
    dex: "0x007730cd28ee1cdc9e999336cbc430f99e7c44397c0aa77516f6f23a78559bb5",
    amountIn,
    amountOut,
    assetIn,
    assetOut,
  };
}

function parseLiquidswapV0Event(
  event: Types.Event,
  dex:
    | "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12"
    | "0x163df34fccbf003ce219d3f1d9e70d140b60622cb9dd47599c25fb2f797ba6e",
): Swap | undefined {
  if (!event.type.startsWith(`${dex}::liquidity_pool::SwapEvent`)) {
    return undefined;
  }

  const typeArgsMatch = event.type.match(/<(.+)>/);
  const typeArgs = typeArgsMatch
    ? typeArgsMatch[1].split(",").map((arg) => arg.trim())
    : [];

  const data: {
    x_in: string;
    x_out: string;
    y_in: string;
    y_out: string;
  } = event.data;

  const [amountInRaw, amountOutRaw, assetIn, assetOut] =
    data.x_in === "0"
      ? [data.y_in, data.x_out, typeArgs[1], typeArgs[0]]
      : [data.x_in, data.y_out, typeArgs[0], typeArgs[1]];

  const amountIn = Number(amountInRaw);
  const amountOut = Number(amountOutRaw);

  return {
    actionType: "swap",
    dex,
    amountIn,
    amountOut,
    assetIn,
    assetOut,
  };
}

function parseBasicSwapEvent(
  event: Types.Event,
  dex:
    | "0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa"
    | "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c"
    | "0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c",
): Swap | undefined {
  if (
    !event.type.startsWith(`${dex}::swap::SwapEvent`) &&
    !event.type.startsWith(
      "0x16fe2df00ea7dde4a63409201f7f4e536bde7bb7335526a35d05111e68aa322c::AnimeSwapPoolV1::SwapEvent",
    )
  ) {
    return undefined;
  }

  const typeArgsMatch = event.type.match(/<(.+)>/);
  const typeArgs = typeArgsMatch
    ? typeArgsMatch[1].split(",").map((arg) => arg.trim())
    : [];

  const data: {
    amount_x_in: string;
    amount_y_in: string;
    amount_x_out: string;
    amount_y_out: string;
  } = event.data;

  const [amountInRaw, amountOutRaw, assetIn, assetOut] =
    data.amount_x_in === "0"
      ? [data.amount_y_in, data.amount_x_out, typeArgs[1], typeArgs[0]]
      : [data.amount_x_in, data.amount_y_out, typeArgs[0], typeArgs[1]];

  const amountIn = Number(amountInRaw);
  const amountOut = Number(amountOutRaw);

  return {
    actionType: "swap",
    dex,
    amountIn,
    amountOut,
    assetIn,
    assetOut,
  };
}

function parseOrbicSwapEvent(event: Types.Event): Swap | undefined {
  if (
    event.type !==
    "0xc7ea756470f72ae761b7986e4ed6fd409aad183b1b2d3d2f674d979852f45c4b::piece_swap::SwapEvent"
  ) {
    return undefined;
  }

  const data: {
    x_in: string;
    y_out: string;
    x: {
      account_address: string;
      module_name: string;
      struct_name: string;
    };
    y: {
      account_address: string;
      module_name: string;
      struct_name: string;
    };
  } = event.data;

  const assetIn = convertCoinInfoToCoinType(data.x);
  const assetOut = convertCoinInfoToCoinType(data.y);

  const amountIn = Number(data.x_in);
  const amountOut = Number(data.y_out);

  return {
    actionType: "swap",
    dex: "0xc7ea756470f72ae761b7986e4ed6fd409aad183b1b2d3d2f674d979852f45c4b",
    amountIn,
    amountOut,
    assetIn,
    assetOut,
  };
}

function parseAuxEvent(event: Types.Event): Swap | undefined {
  if (
    event.type !==
    "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541::amm::SwapEvent"
  ) {
    return undefined;
  }

  const data: {
    in_au: string;
    in_coin_type: string;
    out_au: string;
    out_coin_type: string;
  } = event.data;

  const amountIn = Number(data.in_au);
  const amountOut = Number(data.out_au);
  const assetIn = data.in_coin_type;
  const assetOut = data.out_coin_type;

  return {
    actionType: "swap",
    dex: "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541",
    amountIn,
    amountOut,
    assetIn,
    assetOut,
  };
}

function parseCellanaEvent(event: Types.Event): Swap | undefined {
  if (
    event.type !==
    "0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1::liquidity_pool::SwapEvent"
  ) {
    return undefined;
  }

  const data: {
    amount_in: string;
    amount_out: string;
    from_token: string;
    to_token: string;
    pool: string;
  } = event.data;

  const amountIn = Number(data.amount_in);
  const amountOut = Number(data.amount_out);
  const assetIn = data.from_token;
  const assetOut = data.to_token;

  return {
    actionType: "swap",
    dex: "0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1",
    amountIn,
    amountOut,
    assetIn,
    assetOut,
  };
}

function parseThetisSwapEvent(event: Types.Event): Swap | undefined {
  if (
    event.type !==
    "0xc727553dd5019c4887581f0a89dca9c8ea400116d70e9da7164897812c6646e::pool_event::Swap"
  ) {
    return undefined;
  }

  const data: {
    amount_in: string;
    amount_out: string;
    token_in: string;
    token_out: string;
  } = event.data;

  const amountIn = Number(data.amount_in);
  const amountOut = Number(data.amount_out);
  const assetIn = data.token_in;
  const assetOut = data.token_out;

  return {
    actionType: "swap",
    dex: "0xc727553dd5019c4887581f0a89dca9c8ea400116d70e9da7164897812c6646e",
    amountIn,
    amountOut,
    assetIn,
    assetOut,
  };
}

function parseCetusSwapEvent(event: Types.Event): Swap | undefined {
  if (
    event.type !==
    "0xec42a352cc65eca17a9fa85d0fc602295897ed6b8b8af6a6c79ef490eb8f9eba::amm_swap::SwapEvent"
  ) {
    return undefined;
  }

  const data: {
    a_in: string;
    a_out: string;
    b_in: string;
    b_out: string;
    coin_a_info: {
      account_address: string;
      module_name: string;
      struct_name: string;
    };
    coin_b_info: {
      account_address: string;
      module_name: string;
      struct_name: string;
    };
  } = event.data;

  const coinA = convertCoinInfoToCoinType(data.coin_a_info);
  const coinB = convertCoinInfoToCoinType(data.coin_b_info);

  const [amountInRaw, amountOutRaw, assetIn, assetOut] =
    data.a_in === "0"
      ? [data.b_in, data.a_out, coinB, coinA]
      : [data.a_in, data.b_out, coinA, coinB];

  const amountIn = Number(amountInRaw);
  const amountOut = Number(amountOutRaw);

  return {
    actionType: "swap",
    dex: "0xec42a352cc65eca17a9fa85d0fc602295897ed6b8b8af6a6c79ef490eb8f9eba",
    amountIn,
    amountOut,
    assetIn,
    assetOut,
  };
}

function parseHyperionSwapEvent(event: Types.Event): Swap | undefined {
  if (
    event.type !==
      "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c::pool_v3::SwapEvent" &&
    event.type !==
      "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c::pool_v3::SwapEventV2"
  ) {
    return undefined;
  }

  const data: {
    amount_in: string;
    amount_out: string;
    from_token: {inner: string};
    to_token: {inner: string};
    protocol_fee_amount: string;
  } = event.data;

  const amountIn = Number(data.amount_in) + Number(data.protocol_fee_amount);
  const amountOut = Number(data.amount_out);
  const assetIn = data.from_token.inner;
  const assetOut = data.to_token.inner;

  return {
    actionType: "swap",
    dex: "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c",
    amountIn,
    amountOut,
    assetIn,
    assetOut,
  };
}

function parseEconiaEvent(
  event: Types.Event,
  state: EconiaState,
  ready: boolean,
): Swap | undefined {
  if (!event.type.startsWith(ECONIA_CONTRACT)) {
    return undefined;
  }

  if (event.type === `${ECONIA_CONTRACT}::market::PlaceSwapOrderEvent`) {
    state.orderID = event.data.order_id as string;
    state.placeSwapOrder = event;
  } else if (event.type === `${ECONIA_CONTRACT}::user::CancelOrderEvent`) {
    state.hasCancelOrder = true;
  } else if (event.type === `${ECONIA_CONTRACT}::user::FillEvent`) {
    state.fills.push(event);
  }

  if (!(state.placeSwapOrder && state.hasCancelOrder && ready))
    return undefined;
  const placeOrder: {
    order_id: string;
    // if true, sell base, otherwise buy base
    direction: boolean;
    market_id: string;
    max_base: string;
    max_quote: string;
  } = state.placeSwapOrder.data;
  const fills: {
    market_id: string;
    size: string;
    price: string;
    taker_quote_fees_paid: string;
  }[] = state.fills.map((fill) => fill.data);

  const baseMarket = ECONIA_MARKETS.find(
    (market) => market.market_id === Number(placeOrder.market_id),
  )!;
  const quoteMarket = ECONIA_MARKETS.find(
    (market) => market.market_id === Number(placeOrder.market_id),
  )!;
  const baseAsset = `${baseMarket.base_account_address}::${baseMarket.base_module_name}::${baseMarket.base_struct_name}`;
  const quoteAsset = `${quoteMarket.quote_account_address}::${quoteMarket.quote_module_name}::${quoteMarket.quote_struct_name}`;
  if (placeOrder.direction) {
    // sell base asset
    const soldBase = fills.reduce(
      (sum, fill) => sum + BigInt(fill.size) * BigInt(baseMarket.lot_size),
      0n,
    );
    const boughtQuote = fills.reduce(
      (sum, fill) =>
        sum +
        (BigInt(fill.size) *
          BigInt(fill.price) *
          BigInt(quoteMarket.tick_size) -
          BigInt(fill.taker_quote_fees_paid)),
      0n,
    );
    // const remainedBase = BigInt(placeOrder.max_base) - soldBase;
    const amountIn = Number(soldBase);
    const amountOut = Number(boughtQuote);
    return {
      actionType: "swap",
      dex: ECONIA_CONTRACT,
      amountIn,
      amountOut,
      assetIn: baseAsset,
      assetOut: quoteAsset,
    };
  } else {
    // buy base asset
    const boughtBase = fills.reduce(
      (sum, fill) => sum + BigInt(fill.size) * BigInt(baseMarket.lot_size),
      0n,
    );
    const soldQuote = fills.reduce(
      (sum, fill) =>
        sum +
        (BigInt(fill.size) *
          BigInt(fill.price) *
          BigInt(quoteMarket.tick_size) +
          BigInt(fill.taker_quote_fees_paid)),
      0n,
    );
    // const remainedQuote = BigInt(placeOrder.max_quote) - soldQuote;
    const amountIn = Number(soldQuote);
    const amountOut = Number(boughtBase);
    return {
      actionType: "swap",
      dex: ECONIA_CONTRACT,
      amountIn,
      amountOut,
      assetIn: quoteAsset,
      assetOut: baseAsset,
    };
  }
}

function convertCoinInfoToCoinType(coinInfo: {
  account_address: string;
  module_name: string;
  struct_name: string;
}): string {
  return `${coinInfo.account_address}::${hexToUtf8(coinInfo.module_name)}::${hexToUtf8(coinInfo.struct_name)}`;
}

function hexToUtf8(hexWith0x: string): string {
  return TEXT_DECODER.decode(Hex.fromHexString(hexWith0x).toUint8Array());
}
