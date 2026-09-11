import type {CoinDescription} from "../../../api/hooks/useGetCoinList";
import {TransactionTypeName} from "../../../components/TransactionType";
import {getFormattedBalanceStr} from "../../../components/IndividualPageContent/ContentValue/CurrencyValue";
import type {Types} from "~/types/aptos";
import {extractEntryFunctionPayload} from "../../../utils/cliCommand";
import {tryStandardizeAddress} from "../../../utils";
import {
  CONFIDENTIAL_ASSET_MODULE,
  type ConfidentialAssetAction,
  parseConfidentialAssetFromPayload,
  confidentialAssetEventParsers,
} from "../confidentialAsset/parseConfidentialAssetEvents";
import type {FungibleAssetActivity} from "../utils";
import {findCoinData} from "../utils";
import {identifyPaymentsFromClientTrace} from "./clientTrace";
import {mermaidNodeId, shortPaymentLabel} from "./mermaid";
import type {
  IdentifyPaymentsInput,
  PaymentAmount,
  PaymentFeeLine,
  PaymentFlowEdge,
  PaymentFlowGraph,
  PaymentFlowNode,
  PaymentIdentification,
  PaymentKind,
  PaymentPrimaryKind,
  PaymentStep,
} from "./types";

export const APT_FA_METADATA = "0xa";
export const APT_COIN_TYPE = "0x1::aptos_coin::AptosCoin";
export const FEE_STATEMENT_EVENT_TYPE = "0x1::transaction_fee::FeeStatement";

export const P2P_ENTRY_FUNCTIONS = new Set([
  "0x1::coin::transfer",
  "0x1::aptos_account::transfer",
  "0x1::aptos_account::transfer_coins",
  "0x1::aptos_account::fungible_transfer_only",
  "0x1::aptos_account::transfer_fungible_assets",
  "0x1::aptos_account::batch_transfer",
  "0x1::aptos_account::batch_transfer_coins",
  "0x1::aptos_account::batch_transfer_fungible_assets",
  "0x1::primary_fungible_store::transfer",
  "0x1::fungible_asset::transfer",
]);

const CONTROLLED_FUNCTION_MARKERS = [
  "transfer_with_ref",
  "deposit_with_ref",
  "withdraw_with_ref",
  "dispatchable_fungible_asset",
] as const;

type Movement = {
  index: number;
  owner: string;
  assetId: string;
  amount: bigint;
  direction: "in" | "out";
};

type MatchedHop = {
  from: string;
  to: string;
  assetId: string;
  amountOut: bigint;
  amountIn: bigint;
};

function extractObjectInner(arg: unknown): string {
  if (typeof arg === "object" && arg !== null && "inner" in arg) {
    return (arg as {inner: string}).inner;
  }
  return String(arg);
}

function isNonEmptyVector(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

export function sameAddress(
  a: string | undefined,
  b: string | undefined,
): boolean {
  if (!a || !b) return false;
  const sa = tryStandardizeAddress(a) ?? a.toLowerCase();
  const sb = tryStandardizeAddress(b) ?? b.toLowerCase();
  return sa === sb;
}

function addr(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return tryStandardizeAddress(value) ?? value;
}

function isAptAsset(assetId: string): boolean {
  const standardized = tryStandardizeAddress(assetId);
  if (standardized) {
    const aptFa = tryStandardizeAddress(APT_FA_METADATA);
    if (aptFa && standardized === aptFa) return true;
  }
  return assetId.includes("aptos_coin::AptosCoin");
}

export function canonicalAssetId(assetId: string): string {
  if (isAptAsset(assetId)) {
    return tryStandardizeAddress(APT_FA_METADATA) ?? APT_FA_METADATA;
  }
  return tryStandardizeAddress(assetId) ?? assetId;
}

function assetMeta(
  assetId: string,
  coinData: CoinDescription[] | undefined,
  fallbackSymbol?: string,
  fallbackDecimals?: number,
): {id: string; symbol: string; decimals: number} {
  const id = canonicalAssetId(assetId);
  if (isAptAsset(id)) {
    return {id, symbol: "APT", decimals: 8};
  }
  const coin = findCoinData(coinData, assetId) ?? findCoinData(coinData, id);
  const symbol =
    fallbackSymbol ||
    coin?.panoraSymbol ||
    coin?.symbol ||
    shortPaymentLabel(id);
  const decimals = fallbackDecimals ?? coin?.decimals ?? 0;
  return {id, symbol, decimals};
}

function publicAmount(
  raw: bigint | string,
  assetId: string,
  coinData: CoinDescription[] | undefined,
  fallbackSymbol?: string,
  fallbackDecimals?: number,
): PaymentAmount {
  const meta = assetMeta(assetId, coinData, fallbackSymbol, fallbackDecimals);
  return {
    visibility: "public",
    raw: typeof raw === "bigint" ? raw.toString() : raw,
    assetId: meta.id,
    symbol: meta.symbol,
    decimals: meta.decimals,
  };
}

function encryptedAmount(
  assetId: string,
  coinData: CoinDescription[] | undefined,
  involvesConnectedWallet: boolean,
): PaymentAmount {
  const meta = assetMeta(assetId, coinData);
  return {
    visibility: "encrypted",
    assetId: meta.id,
    symbol: meta.symbol,
    decimals: meta.decimals,
    involvesConnectedWallet,
  };
}

export function formatPaymentAmount(amount: PaymentAmount): string {
  if (amount.visibility === "encrypted") {
    return `encrypted ${amount.symbol}`;
  }
  const raw = amount.raw ?? "0";
  const formatted =
    amount.decimals > 0 ? getFormattedBalanceStr(raw, amount.decimals) : raw;
  return `${formatted} ${amount.symbol}`;
}

export function isControlledTransferFunction(functionId: string): boolean {
  const lower = functionId.toLowerCase();
  return CONTROLLED_FUNCTION_MARKERS.some((marker) => lower.includes(marker));
}

export function partnerModuleAddress(functionId: string): string | undefined {
  const moduleAddr = functionId.split("::")[0];
  return addr(moduleAddr);
}

function entryFunctionId(transaction: Types.Transaction): string | undefined {
  const payload = extractEntryFunctionPayload(transaction);
  return payload?.function;
}

function getFeePayer(transaction: Types.Transaction): string | undefined {
  if (!("signature" in transaction) || !transaction.signature) {
    return undefined;
  }
  const sig = transaction.signature as {fee_payer_address?: string};
  if (typeof sig.fee_payer_address === "string") {
    return addr(sig.fee_payer_address);
  }
  return undefined;
}

function uintString(value: unknown): string | undefined {
  if (typeof value === "string" && /^\d+$/.test(value)) return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  return undefined;
}

export function parsePaymentFees(
  transaction: Types.Transaction,
  partnerFees: PaymentAmount[] = [],
): PaymentFeeLine[] {
  if (!("gas_used" in transaction) || !("gas_unit_price" in transaction)) {
    return [];
  }
  const gasUsed = BigInt(transaction.gas_used);
  const gasUnitPrice = BigInt(transaction.gas_unit_price);
  const sender = "sender" in transaction ? addr(transaction.sender) : undefined;
  const payer = getFeePayer(transaction) ?? sender;
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];
  const feeStatement = events.find((e) => e.type === FEE_STATEMENT_EVENT_TYPE);
  const lines: PaymentFeeLine[] = [];

  if (feeStatement) {
    const data = feeStatement.data as Record<string, unknown>;
    const execution = uintString(data.execution_gas_units);
    const io = uintString(data.io_gas_units);
    const storage = uintString(data.storage_fee_octas);
    const refund = uintString(data.storage_fee_refund_octas);
    const total =
      uintString(data.total_charge_gas_units) ?? transaction.gas_used;
    if (execution) {
      lines.push({
        id: "fee-execution",
        kind: "execution",
        label: "Execution (compute)",
        explanation:
          "Gas charged for Move execution. Shown in octas at this transaction's gas unit price.",
        amountOctas: (BigInt(execution) * gasUnitPrice).toString(),
        payer,
      });
    }
    if (io) {
      lines.push({
        id: "fee-io",
        kind: "io",
        label: "I/O (storage access)",
        explanation:
          "Gas charged for reading and writing on-chain state during execution.",
        amountOctas: (BigInt(io) * gasUnitPrice).toString(),
        payer,
      });
    }
    if (storage) {
      lines.push({
        id: "fee-storage",
        kind: "storage",
        label: "Storage fee",
        explanation:
          "Charged for net new state created by this transaction, priced in octas (not gas units).",
        amountOctas: storage,
        payer,
      });
    }
    if (refund && refund !== "0") {
      lines.push({
        id: "fee-storage-refund",
        kind: "storage_refund",
        label: "Storage fee refund",
        explanation:
          "Credited when this transaction released state. Subtracted from the net fee; not part of gas_used.",
        amountOctas: refund,
        payer,
      });
    }
    const gross = BigInt(total) * gasUnitPrice;
    const refundOctas = refund ? BigInt(refund) : BigInt(0);
    const net = gross - refundOctas;
    lines.push({
      id: "fee-net",
      kind: "net",
      label: "Net network fee",
      explanation: payer
        ? `Gas plus storage, minus storage refunds. Paid by ${shortPaymentLabel(payer)}${sameAddress(payer, sender) ? " (the sender)" : " (a fee payer / sponsor)"}.`
        : "Gas plus storage, minus storage refunds.",
      amountOctas: net.toString(),
      payer,
    });
  } else {
    const gross = gasUsed * gasUnitPrice;
    lines.push({
      id: "fee-gas",
      kind: "gas",
      label: "Gas fee",
      explanation:
        "gas_used × gas_unit_price. No FeeStatement event was present to split execution, I/O, and storage.",
      amountOctas: gross.toString(),
      payer,
    });
    lines.push({
      id: "fee-net",
      kind: "net",
      label: "Net network fee",
      explanation: payer
        ? `Paid by ${shortPaymentLabel(payer)}.`
        : "Paid by the transaction sender.",
      amountOctas: gross.toString(),
      payer,
    });
  }

  partnerFees.forEach((fee, i) => {
    if (!fee.raw || fee.raw === "0") return;
    lines.push({
      id: `fee-partner-${i}`,
      kind: "partner",
      label: `Partner / protocol fee (${fee.symbol})`,
      explanation:
        "Difference between the amount withdrawn and the amount deposited for this asset — typically a transfer hook, DEX protocol fee, or partner skim.",
      amountOctas: isAptAsset(fee.assetId) ? fee.raw : fee.raw,
      payer: sender,
    });
  });

  return lines;
}

function changesByAddress(
  transaction: Types.Transaction,
): Record<string, Types.WriteSetChange[]> {
  const map: Record<string, Types.WriteSetChange[]> = {};
  if (!("changes" in transaction)) return map;
  for (const change of transaction.changes) {
    if (
      (change.type === "write_resource" || change.type === "create_resource") &&
      "address" in change
    ) {
      const key = tryStandardizeAddress(change.address);
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(change);
    }
  }
  return map;
}

function resolveStoreOwner(
  storeAddr: string,
  byAddress: Record<string, Types.WriteSetChange[]>,
): string | undefined {
  const key = tryStandardizeAddress(storeAddr);
  if (!key) return undefined;
  for (const change of byAddress[key] ?? []) {
    if (!("data" in change) || !change.data) continue;
    const data = change.data as {type?: string; data?: {owner?: string}};
    if (data.type === "0x1::object::ObjectCore" && data.data?.owner) {
      return addr(data.data.owner);
    }
  }
  return undefined;
}

function resolveStoreMetadata(
  storeAddr: string,
  byAddress: Record<string, Types.WriteSetChange[]>,
): string | undefined {
  const key = tryStandardizeAddress(storeAddr);
  if (!key) return undefined;
  for (const change of byAddress[key] ?? []) {
    if (!("data" in change) || !change.data) continue;
    const data = change.data as {
      type?: string;
      data?: {metadata?: {inner?: string}};
    };
    if (
      data.type === "0x1::fungible_asset::FungibleStore" &&
      data.data?.metadata?.inner
    ) {
      return canonicalAssetId(data.data.metadata.inner);
    }
  }
  return undefined;
}

function coinTypeFromEvent(eventType: string): string | undefined {
  const match = eventType.match(/<(.*)>$/);
  return match?.[1]?.trim();
}

function isFaWithdraw(type: string): boolean {
  return (
    type === "0x1::fungible_asset::Withdraw" ||
    type === "0x1::fungible_asset::WithdrawEvent" ||
    type.endsWith("::fungible_asset::Withdraw")
  );
}

function isFaDeposit(type: string): boolean {
  return (
    type === "0x1::fungible_asset::Deposit" ||
    type === "0x1::fungible_asset::DepositEvent" ||
    type.endsWith("::fungible_asset::Deposit")
  );
}

function isCoinWithdraw(type: string): boolean {
  return (
    type === "0x1::coin::WithdrawEvent" ||
    type.startsWith("0x1::coin::WithdrawEvent<") ||
    type.startsWith("0x1::coin::CoinWithdraw")
  );
}

function isCoinDeposit(type: string): boolean {
  return (
    type === "0x1::coin::DepositEvent" ||
    type.startsWith("0x1::coin::DepositEvent<") ||
    type.startsWith("0x1::coin::CoinDeposit")
  );
}

function isGasFeeType(type: string): boolean {
  return type.includes("GasFee");
}

export function collectMovements(
  transaction: Types.Transaction,
  indexerActivities: FungibleAssetActivity[] | undefined,
): Movement[] {
  const movements: Movement[] = [];
  const byAddress = changesByAddress(transaction);
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];

  events.forEach((event, index) => {
    if (isGasFeeType(event.type)) return;
    const data = event.data as Record<string, unknown>;

    if (isFaWithdraw(event.type) || isFaDeposit(event.type)) {
      const store = typeof data.store === "string" ? data.store : undefined;
      const amountRaw = uintString(data.amount);
      if (!store || !amountRaw) return;
      const owner = resolveStoreOwner(store, byAddress) ?? addr(store);
      const assetId =
        resolveStoreMetadata(store, byAddress) ?? canonicalAssetId(store);
      if (!owner) return;
      movements.push({
        index,
        owner,
        assetId,
        amount: BigInt(amountRaw),
        direction: isFaDeposit(event.type) ? "in" : "out",
      });
      return;
    }

    if (isCoinWithdraw(event.type) || isCoinDeposit(event.type)) {
      const amountRaw = uintString(data.amount);
      const owner = addr(event.guid.account_address);
      if (!amountRaw || !owner) return;
      const coinType = coinTypeFromEvent(event.type) ?? APT_COIN_TYPE;
      movements.push({
        index,
        owner,
        assetId: canonicalAssetId(coinType),
        amount: BigInt(amountRaw),
        direction: isCoinDeposit(event.type) ? "in" : "out",
      });
    }
  });

  if (movements.length === 0 && indexerActivities) {
    indexerActivities.forEach((activity, index) => {
      if (isGasFeeType(activity.type)) return;
      if (activity.amount === null || activity.amount === undefined) return;
      const owner = addr(activity.owner_address);
      if (!owner) return;
      const isIn =
        activity.type.includes("Deposit") ||
        activity.type.includes("Mint") ||
        activity.type.includes("Transfer");
      const isOut =
        activity.type.includes("Withdraw") || activity.type.includes("Burn");
      if (!isIn && !isOut) return;
      movements.push({
        index: 1000 + (activity.event_index ?? index),
        owner,
        assetId: canonicalAssetId(activity.asset_type),
        amount: BigInt(activity.amount),
        direction: isOut ? "out" : "in",
      });
    });
  }

  return movements;
}

function matchHops(movements: Movement[]): MatchedHop[] {
  const outs = movements
    .filter((m) => m.direction === "out")
    .sort((a, b) => a.index - b.index);
  const ins = movements
    .filter((m) => m.direction === "in")
    .sort((a, b) => a.index - b.index);
  const used = new Set<number>();
  const hops: MatchedHop[] = [];

  for (const out of outs) {
    const exact = ins.find(
      (incoming) =>
        !used.has(incoming.index) &&
        incoming.assetId === out.assetId &&
        incoming.owner !== out.owner &&
        incoming.amount === out.amount &&
        incoming.index >= out.index,
    );
    const any = exact
      ? undefined
      : ins.find(
          (incoming) =>
            !used.has(incoming.index) &&
            incoming.assetId === out.assetId &&
            incoming.owner !== out.owner &&
            incoming.index >= out.index,
        );
    const match = exact ?? any;
    if (!match) continue;
    used.add(match.index);
    hops.push({
      from: out.owner,
      to: match.owner,
      assetId: out.assetId,
      amountOut: out.amount,
      amountIn: match.amount,
    });
  }
  return hops;
}

function parseConfidentialActions(
  transaction: Types.Transaction,
): ConfidentialAssetAction[] {
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];
  const fromEvents: ConfidentialAssetAction[] = [];
  for (const event of events) {
    for (const parse of confidentialAssetEventParsers) {
      const parsed = parse(event);
      if (parsed) fromEvents.push(parsed);
    }
  }
  const fromPayload = parseConfidentialAssetFromPayload(
    transaction,
    fromEvents,
  );
  return [...fromEvents, ...fromPayload];
}

function hasVoluntaryAuditor(transaction: Types.Transaction): boolean {
  const payload = extractEntryFunctionPayload(transaction);
  if (!payload) return false;
  if (
    payload.function !==
    `${CONFIDENTIAL_ASSET_MODULE}::confidential_transfer_raw`
  ) {
    return false;
  }
  // signer is omitted from REST arguments; ek_volun_auds is index 9.
  return isNonEmptyVector(payload.arguments[9]);
}

type SwapHit = {
  trader?: string;
  amountIn: string;
  amountOut: string;
  assetIn: string;
  assetOut: string;
  dex?: string;
};

function firstNumeric(
  data: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = uintString(data[key]);
    if (value && value !== "0") return value;
    if (value === "0") {
      // keep looking for a non-zero field; remember zero as last resort
    }
  }
  for (const key of keys) {
    const value = uintString(data[key]);
    if (value) return value;
  }
  return undefined;
}

function firstStringField(
  data: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.length > 0) return value;
    if (value && typeof value === "object" && "inner" in value) {
      return extractObjectInner(value);
    }
  }
  return undefined;
}

export function parseExchangeEvent(event: Types.Event): SwapHit | undefined {
  const typeLower = event.type.toLowerCase();
  if (!typeLower.includes("swap")) return undefined;
  const withoutGenerics = event.type.replace(/<[\s\S]*$/, "");
  const eventName = withoutGenerics.split("::").pop() ?? "";
  if (!/swap/i.test(eventName)) return undefined;

  const data = event.data as Record<string, unknown>;
  const amountXIn = uintString(data.amount_x_in);
  const amountYIn = uintString(data.amount_y_in);
  const amountXOut = uintString(data.amount_x_out);
  const amountYOut = uintString(data.amount_y_out);
  const typeArgsMatch = event.type.match(/<(.+)>/);
  const typeArgs = typeArgsMatch
    ? typeArgsMatch[1].split(",").map((part) => part.trim())
    : [];

  let amountIn: string | undefined;
  let amountOut: string | undefined;
  let assetIn: string | undefined;
  let assetOut: string | undefined;

  if (
    amountXIn !== undefined &&
    amountYOut !== undefined &&
    typeArgs.length >= 2
  ) {
    if (amountXIn !== "0") {
      amountIn = amountXIn;
      amountOut = amountYOut;
      assetIn = typeArgs[0];
      assetOut = typeArgs[1];
    } else if (amountYIn && amountXOut) {
      amountIn = amountYIn;
      amountOut = amountXOut;
      assetIn = typeArgs[1];
      assetOut = typeArgs[0];
    }
  }

  if (!amountIn) {
    amountIn = firstNumeric(data, [
      "amount_in",
      "amount_x_in",
      "x_in",
      "in_au",
      "from_amount",
      "input_amount",
      "sold",
    ]);
    amountOut = firstNumeric(data, [
      "amount_out",
      "amount_y_out",
      "y_out",
      "out_au",
      "to_amount",
      "output_amount",
      "bought",
    ]);
    assetIn = firstStringField(data, [
      "asset_in",
      "from_token",
      "from_coin",
      "x",
      "token_in",
    ]);
    assetOut = firstStringField(data, [
      "asset_out",
      "to_token",
      "to_coin",
      "y",
      "token_out",
    ]);
    if (!assetIn && typeArgs[0]) assetIn = typeArgs[0];
    if (!assetOut && typeArgs[1]) assetOut = typeArgs[1];
  }

  if (!amountIn || !amountOut || !assetIn || !assetOut) {
    return undefined;
  }

  const dex = addr(event.type.split("::")[0]);
  return {amountIn, amountOut, assetIn, assetOut, dex};
}

function parsePayloadTransfers(
  transaction: Types.Transaction,
  coinData: CoinDescription[] | undefined,
): PaymentStep[] {
  if (!("sender" in transaction)) return [];
  const payload = extractEntryFunctionPayload(transaction);
  if (!payload) return [];
  const fn = payload.function;
  const sender = addr(transaction.sender);
  if (!sender) return [];
  if (fn.startsWith(CONFIDENTIAL_ASSET_MODULE)) return [];
  const args = payload.arguments;
  const steps: PaymentStep[] = [];
  const controlled = isControlledTransferFunction(fn);
  const kind: PaymentKind =
    controlled || !P2P_ENTRY_FUNCTIONS.has(fn) ? "controlled" : "p2p";
  const entryName = fn.split("::").pop() ?? "";
  // Only treat as a payload transfer when it looks like a transfer, not an arbitrary contract call.
  const looksLikeTransfer =
    P2P_ENTRY_FUNCTIONS.has(fn) || controlled || /^transfer/i.test(entryName);
  if (!looksLikeTransfer) return [];

  const partner = kind === "controlled" ? partnerModuleAddress(fn) : undefined;
  const partnerLabel = controlled
    ? "TransferRef / dispatchable partner"
    : kind === "controlled"
      ? "partner module"
      : undefined;

  const push = (
    to: string,
    amountRaw: string,
    assetId: string,
    extra?: Partial<PaymentStep>,
  ) => {
    const amount = publicAmount(amountRaw, assetId, coinData);
    steps.push({
      id: `payload-${steps.length}-${to}`,
      kind,
      title:
        kind === "p2p"
          ? "Peer-to-peer transfer"
          : "Controlled transfer through a partner",
      explanation: explainTransfer(
        kind,
        sender,
        to,
        amount,
        partner,
        partnerLabel,
      ),
      from: sender,
      to: addr(to) ?? to,
      partner,
      partnerLabel,
      amount,
      ...extra,
    });
  };

  if (
    fn === "0x1::coin::transfer" ||
    fn === "0x1::aptos_account::transfer_coins"
  ) {
    if (args.length >= 2) {
      const coinType = payload.type_arguments[0] ?? APT_COIN_TYPE;
      push(String(args[0]), String(args[1]), coinType);
    }
    return steps;
  }

  if (fn === "0x1::aptos_account::transfer") {
    if (args.length >= 2) {
      push(String(args[0]), String(args[1]), APT_FA_METADATA);
    }
    return steps;
  }

  if (
    fn === "0x1::aptos_account::transfer_fungible_assets" ||
    fn === "0x1::primary_fungible_store::transfer" ||
    fn === "0x1::aptos_account::fungible_transfer_only"
  ) {
    if (args.length >= 3) {
      push(String(args[1]), String(args[2]), extractObjectInner(args[0]));
    }
    return steps;
  }

  if (
    fn === "0x1::fungible_asset::transfer" ||
    fn.includes("dispatchable_fungible_asset::transfer")
  ) {
    if (args.length >= 3) {
      const byAddress = changesByAddress(transaction);
      const toStore = extractObjectInner(args[1]);
      const to = resolveStoreOwner(toStore, byAddress) ?? toStore;
      const metadata =
        resolveStoreMetadata(toStore, byAddress) ?? extractObjectInner(args[0]);
      push(to, String(args[2]), metadata);
    }
    return steps;
  }

  if (
    fn === "0x1::aptos_account::batch_transfer" ||
    fn === "0x1::aptos_account::batch_transfer_coins"
  ) {
    const recipients = args[0];
    const amounts = args[1];
    const coinType = payload.type_arguments[0] ?? APT_FA_METADATA;
    if (Array.isArray(recipients) && Array.isArray(amounts)) {
      recipients.forEach((recipient, i) => {
        push(String(recipient), String(amounts[i]), coinType);
      });
    }
    return steps;
  }

  if (fn === "0x1::aptos_account::batch_transfer_fungible_assets") {
    const metadata = extractObjectInner(args[0]);
    const recipients = args[1];
    const amounts = args[2];
    if (Array.isArray(recipients) && Array.isArray(amounts)) {
      recipients.forEach((recipient, i) => {
        push(String(recipient), String(amounts[i]), metadata);
      });
    }
    return steps;
  }

  if (controlled && args.length >= 2) {
    // Best-effort: metadata + recipient + amount is the common TransferRef shape.
    const maybeAmount = args.length >= 3 ? String(args[2]) : undefined;
    const maybeTo = String(args[1]);
    const maybeAsset = extractObjectInner(args[0]);
    if (maybeAmount && /^\d+$/.test(maybeAmount)) {
      push(maybeTo, maybeAmount, maybeAsset);
    }
  }

  return steps;
}

function explainTransfer(
  kind: PaymentKind,
  from: string,
  to: string,
  amount: PaymentAmount,
  partner: string | undefined,
  partnerLabel: string | undefined,
): string {
  const amountText = formatPaymentAmount(amount);
  const fromLabel = shortPaymentLabel(from);
  const toLabel = shortPaymentLabel(to);
  if (kind === "p2p") {
    return `${fromLabel} sent ${amountText} directly to ${toLabel}. This is a standard peer-to-peer payment with no intermediary.`;
  }
  const partnerText = partner
    ? `${partnerLabel ?? "partner"} ${shortPaymentLabel(partner)}`
    : (partnerLabel ?? "a partner");
  return `${fromLabel} sent ${amountText} to ${toLabel} through ${partnerText}. The partner can enforce transfer rules (allowlists, freeze, TransferRef) and may take a fee.`;
}

function walletRoleNote(
  connectedWallet: string | undefined,
  from?: string,
  to?: string,
): string {
  if (!connectedWallet) {
    return " Connect the sender or recipient wallet to highlight your role. Encrypted amounts stay hidden.";
  }
  if (sameAddress(connectedWallet, from)) {
    return " You are the sender. The explorer still cannot decrypt confidential-asset ciphertexts: wallets do not expose that decryption key.";
  }
  if (sameAddress(connectedWallet, to)) {
    return " You are the recipient. The explorer still cannot decrypt confidential-asset ciphertexts: wallets do not expose that decryption key.";
  }
  return " Your connected wallet is not a party to this confidential transfer, so the amount stays hidden.";
}

function confidentialSteps(
  transaction: Types.Transaction,
  connectedWallet: string | undefined,
  coinData: CoinDescription[] | undefined,
): PaymentStep[] {
  const actions = parseConfidentialActions(transaction);
  const audited = hasVoluntaryAuditor(transaction);
  const steps: PaymentStep[] = [];
  actions.forEach((action, i) => {
    const from = addr(action.from);
    const to = addr(action.to);
    const account = addr(action.addr);
    const involved =
      sameAddress(connectedWallet, from) ||
      sameAddress(connectedWallet, to) ||
      sameAddress(connectedWallet, account);

    if (action.subAction === "transfer" && from && to) {
      const amount = encryptedAmount(action.metadata, coinData, involved);
      steps.push({
        id: `ca-transfer-${i}`,
        kind: "confidential",
        title: audited
          ? "Confidential transfer (through a partner auditor)"
          : "Confidential transfer",
        explanation: `${shortPaymentLabel(from)} sent an encrypted amount of ${amount.symbol} to ${shortPaymentLabel(to)}. Sender and recipient are public; the amount is encrypted on-chain.${audited ? " Voluntary auditor keys in the payload mean a partner can decrypt this transfer for compliance." : ""}${walletRoleNote(connectedWallet, from, to)}`,
        from,
        to,
        partner: audited ? "voluntary auditor" : undefined,
        partnerLabel: audited ? "voluntary auditor" : undefined,
        amount,
      });
      return;
    }

    if (action.subAction === "deposit" && account) {
      const amount = action.amount
        ? publicAmount(action.amount, action.metadata, coinData)
        : encryptedAmount(action.metadata, coinData, involved);
      steps.push({
        id: `ca-deposit-${i}`,
        kind: "public_to_confidential",
        title: "Public → confidential",
        explanation: `${shortPaymentLabel(account)} deposited ${formatPaymentAmount(amount)} from a public fungible-asset balance into a confidential store. After this, that confidential balance is encrypted.`,
        from: account,
        to: account,
        amount,
      });
      return;
    }

    if (action.subAction === "withdraw" && from && to) {
      const amount = action.amount
        ? publicAmount(action.amount, action.metadata, coinData)
        : encryptedAmount(action.metadata, coinData, involved);
      steps.push({
        id: `ca-withdraw-${i}`,
        kind: "confidential_to_public",
        title: "Confidential → public",
        explanation: `${shortPaymentLabel(from)} withdrew ${formatPaymentAmount(amount)} from a confidential store to ${shortPaymentLabel(to)} as a normal (public) balance. The withdrawn amount is public; any remaining confidential balance stays encrypted.`,
        from,
        to,
        amount,
      });
    }
  });
  return steps;
}

function exchangeFromEvents(
  transaction: Types.Transaction,
  sender: string | undefined,
  coinData: CoinDescription[] | undefined,
): PaymentStep[] {
  const events: Types.Event[] =
    "events" in transaction ? transaction.events : [];
  const steps: PaymentStep[] = [];
  events.forEach((event, i) => {
    const swap = parseExchangeEvent(event);
    if (!swap) return;
    const amountIn = publicAmount(swap.amountIn, swap.assetIn, coinData);
    const amountOut = publicAmount(swap.amountOut, swap.assetOut, coinData);
    const trader = sender;
    steps.push({
      id: `swap-${i}`,
      kind: "exchange",
      title: "Exchange",
      explanation: `${trader ? shortPaymentLabel(trader) : "This account"} exchanged ${formatPaymentAmount(amountIn)} for ${formatPaymentAmount(amountOut)}. These are the inputs and outputs of the swap.`,
      from: trader,
      to: trader,
      partner: swap.dex,
      partnerLabel: swap.dex ? "exchange" : undefined,
      amount: amountIn,
      amountOut,
    });
  });
  return steps;
}

function exchangeFromMovements(
  movements: Movement[],
  sender: string | undefined,
  coinData: CoinDescription[] | undefined,
  alreadyCovered: boolean,
): PaymentStep[] {
  if (alreadyCovered) return [];
  const byOwner = new Map<string, Map<string, bigint>>();
  for (const movement of movements) {
    if (isAptAsset(movement.assetId) && movement.direction === "out") {
      // APT outflows are often gas; still count them, but require a second non-APT asset.
    }
    const ownerMap = byOwner.get(movement.owner) ?? new Map<string, bigint>();
    const signed =
      movement.direction === "in" ? movement.amount : -movement.amount;
    ownerMap.set(
      movement.assetId,
      (ownerMap.get(movement.assetId) ?? BigInt(0)) + signed,
    );
    byOwner.set(movement.owner, ownerMap);
  }

  const steps: PaymentStep[] = [];
  for (const [owner, assets] of byOwner) {
    if (sender && !sameAddress(owner, sender)) continue;
    const ins: {assetId: string; amount: bigint}[] = [];
    const outs: {assetId: string; amount: bigint}[] = [];
    for (const [assetId, net] of assets) {
      if (net > BigInt(0)) ins.push({assetId, amount: net});
      if (net < BigInt(0) && !isAptAsset(assetId)) {
        outs.push({assetId, amount: -net});
      }
      if (net < BigInt(0) && isAptAsset(assetId)) {
        // Ignore pure gas APT unless there is another asset out too (already handled).
      }
    }
    // Treat APT as an output/input only when the other side is a different asset.
    for (const [assetId, net] of assets) {
      if (isAptAsset(assetId) && net < BigInt(0) && ins.length > 0) {
        // APT spent as swap input (beyond gas) — include if there is a non-gas sized out
        // Heuristic: if another asset came in, APT net out is the swap input + gas.
        outs.push({assetId, amount: -net});
      }
    }
    if (outs.length === 0 || ins.length === 0) continue;
    const out = outs[0];
    const inn = ins[0];
    if (out.assetId === inn.assetId) continue;
    const amountIn = publicAmount(out.amount, out.assetId, coinData);
    const amountOut = publicAmount(inn.amount, inn.assetId, coinData);
    steps.push({
      id: `exchange-bal-${owner}`,
      kind: "exchange",
      title: "Exchange",
      explanation: `${shortPaymentLabel(owner)} exchanged ${formatPaymentAmount(amountIn)} for ${formatPaymentAmount(amountOut)} (inferred from this account's inputs and outputs in the transaction).`,
      from: owner,
      to: owner,
      amount: amountIn,
      amountOut,
    });
  }
  return steps;
}

function hopKind(
  functionId: string | undefined,
  hop: MatchedHop,
  sender: string | undefined,
): PaymentKind {
  if (functionId && isControlledTransferFunction(functionId)) {
    return "controlled";
  }
  if (functionId && P2P_ENTRY_FUNCTIONS.has(functionId)) {
    return "p2p";
  }
  if (functionId) {
    const moduleAddr = functionId.split("::")[0];
    const standardized = tryStandardizeAddress(moduleAddr);
    const framework = tryStandardizeAddress("0x1");
    if (standardized && framework && standardized !== framework) {
      return "controlled";
    }
  }
  if (sender && sameAddress(hop.from, sender)) {
    return "p2p";
  }
  return "controlled";
}

function hopsToSteps(
  hops: MatchedHop[],
  functionId: string | undefined,
  sender: string | undefined,
  coinData: CoinDescription[] | undefined,
): PaymentStep[] {
  const intermediates = new Set<string>();
  for (const hop of hops) {
    if (
      hops.some((other) => other !== hop && sameAddress(other.from, hop.to))
    ) {
      intermediates.add(hop.to);
    }
  }

  return hops.map((hop, i) => {
    const viaPartner = intermediates.has(hop.to) || intermediates.has(hop.from);
    let kind = hopKind(functionId, hop, sender);
    if (viaPartner) kind = "controlled";
    const amount = publicAmount(hop.amountIn, hop.assetId, coinData);
    const partnerFee =
      hop.amountOut > hop.amountIn
        ? publicAmount(hop.amountOut - hop.amountIn, hop.assetId, coinData)
        : undefined;
    const partner =
      kind === "controlled"
        ? viaPartner
          ? hops.find(
              (h) => sameAddress(h.to, hop.from) || sameAddress(h.from, hop.to),
            )?.to
          : partnerModuleAddress(functionId ?? "")
        : undefined;
    const partnerLabel = viaPartner
      ? "intermediary"
      : kind === "controlled"
        ? isControlledTransferFunction(functionId ?? "")
          ? "TransferRef / dispatchable partner"
          : "partner module"
        : undefined;
    return {
      id: `hop-${i}`,
      kind,
      title:
        kind === "p2p"
          ? "Peer-to-peer transfer"
          : "Controlled transfer through a partner",
      explanation: explainTransfer(
        kind,
        hop.from,
        hop.to,
        amount,
        partner,
        partnerLabel,
      ),
      from: hop.from,
      to: hop.to,
      partner,
      partnerLabel,
      amount,
      partnerFee,
    };
  });
}

function dedupeSteps(steps: PaymentStep[]): PaymentStep[] {
  const seen = new Set<string>();
  const result: PaymentStep[] = [];
  for (const step of steps) {
    const amountKey =
      step.amount?.visibility === "encrypted"
        ? "enc"
        : (step.amount?.raw ?? "");
    const key = [
      step.kind,
      step.from ?? "",
      step.to ?? "",
      step.amount?.assetId ?? "",
      amountKey,
      step.amountOut?.raw ?? "",
    ].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(step);
  }
  return result;
}

function stepInvolvesWallet(
  step: PaymentStep,
  wallet: string | undefined,
): boolean {
  if (!wallet) return false;
  return (
    sameAddress(wallet, step.from) ||
    sameAddress(wallet, step.to) ||
    sameAddress(wallet, step.partner)
  );
}

function buildFlow(
  steps: PaymentStep[],
  fees: PaymentFeeLine[],
): PaymentFlowGraph {
  const nodes = new Map<string, PaymentFlowNode>();
  const edges: PaymentFlowEdge[] = [];

  const ensure = (
    key: string,
    label: string,
    role: PaymentFlowNode["role"],
    address?: string,
  ): string => {
    const id = mermaidNodeId(key);
    if (!nodes.has(id)) {
      nodes.set(id, {id, label, role, address});
    }
    return id;
  };

  for (const step of steps) {
    if (step.kind === "exchange") {
      const trader = step.from ?? "trader";
      const traderId = ensure(
        `acct-${trader}`,
        shortPaymentLabel(trader),
        "account",
        trader,
      );
      const dexId = ensure(
        `dex-${step.partner ?? "exchange"}`,
        step.partner
          ? `Exchange ${shortPaymentLabel(step.partner)}`
          : "Exchange",
        "exchange",
        step.partner,
      );
      if (step.amount) {
        edges.push({
          from: traderId,
          to: dexId,
          label: `in ${formatPaymentAmount(step.amount)}`,
          kind: "exchange",
        });
      }
      if (step.amountOut) {
        edges.push({
          from: dexId,
          to: traderId,
          label: `out ${formatPaymentAmount(step.amountOut)}`,
          kind: "exchange",
        });
      }
      continue;
    }

    if (
      step.kind === "public_to_confidential" ||
      step.kind === "confidential_to_public"
    ) {
      const account = step.from ?? step.to ?? "account";
      const acctId = ensure(
        `acct-${account}`,
        shortPaymentLabel(account),
        "account",
        account,
      );
      const storeId = ensure(
        `ca-${account}`,
        "Confidential store",
        "confidential_store",
      );
      const label = step.amount
        ? formatPaymentAmount(step.amount)
        : "encrypted";
      if (step.kind === "public_to_confidential") {
        edges.push({
          from: acctId,
          to: storeId,
          label,
          kind: step.kind,
        });
      } else {
        const dest = step.to ?? account;
        const destId = ensure(
          `acct-${dest}`,
          shortPaymentLabel(dest),
          "account",
          dest,
        );
        edges.push({
          from: storeId,
          to: destId,
          label,
          kind: step.kind,
        });
      }
      continue;
    }

    const from = step.from ?? "from";
    const to = step.to ?? "to";
    const fromId = ensure(
      `acct-${from}`,
      shortPaymentLabel(from),
      "account",
      from,
    );
    const toId = ensure(`acct-${to}`, shortPaymentLabel(to), "account", to);
    const amountLabel = step.amount
      ? formatPaymentAmount(step.amount)
      : step.kind;
    if (
      step.partner &&
      step.kind === "controlled" &&
      step.partnerLabel === "intermediary"
    ) {
      const partnerId = ensure(
        `acct-${step.partner}`,
        shortPaymentLabel(step.partner),
        "partner",
        step.partner,
      );
      if (!sameAddress(from, step.partner) && !sameAddress(to, step.partner)) {
        edges.push({
          from: fromId,
          to: partnerId,
          label: amountLabel,
          kind: "controlled",
        });
        edges.push({
          from: partnerId,
          to: toId,
          label: amountLabel,
          kind: "controlled",
        });
        continue;
      }
    }
    if (
      step.partner &&
      step.kind === "controlled" &&
      step.partner !== from &&
      step.partner !== to &&
      step.partner !== "voluntary auditor"
    ) {
      const partnerId = ensure(
        `mod-${step.partner}`,
        `Partner ${shortPaymentLabel(step.partner)}`,
        "partner",
        step.partner,
      );
      edges.push({
        from: fromId,
        to: partnerId,
        label: amountLabel,
        kind: "controlled",
      });
      edges.push({
        from: partnerId,
        to: toId,
        label: amountLabel,
        kind: "controlled",
      });
      continue;
    }
    edges.push({
      from: fromId,
      to: toId,
      label: amountLabel,
      kind: step.kind,
    });
  }

  const net = fees.find((fee) => fee.kind === "net");
  if (net && net.amountOctas !== "0" && net.payer) {
    const payerId = ensure(
      `acct-${net.payer}`,
      shortPaymentLabel(net.payer),
      "account",
      net.payer,
    );
    const feeId = ensure("network-fees", "Network fees", "network");
    edges.push({
      from: payerId,
      to: feeId,
      label: `${getFormattedBalanceStr(net.amountOctas, 8)} APT fee`,
      kind: "fee",
    });
  }

  return {nodes: [...nodes.values()], edges};
}

function primaryKind(steps: PaymentStep[]): PaymentPrimaryKind {
  if (steps.length === 0) return "none";
  const kinds = new Set(steps.map((step) => step.kind));
  if (kinds.size === 1) return steps[0].kind;
  return steps[0].kind;
}

function headlineFor(
  steps: PaymentStep[],
  fees: PaymentFeeLine[],
  success: boolean,
): {headline: string; explanation: string; primaryKind: PaymentPrimaryKind} {
  const prefix = success ? "" : "Failed transaction — intended payment: ";
  if (steps.length === 0) {
    const net = fees.find((fee) => fee.kind === "net");
    if (net && net.amountOctas !== "0") {
      return {
        headline: `${prefix}Network fees only`,
        explanation:
          "No peer-to-peer, partner-controlled, confidential, or exchange payment was identified. This transaction still paid network fees, broken down below.",
        primaryKind: "fees_only",
      };
    }
    return {
      headline: `${prefix}No payment identified`,
      explanation:
        "This transaction did not move coins, fungible assets, or confidential balances in a recognized payment pattern.",
      primaryKind: "none",
    };
  }
  if (steps.length === 1) {
    return {
      headline: `${prefix}${steps[0].title}`,
      explanation: steps[0].explanation,
      primaryKind: steps[0].kind,
    };
  }
  const kinds = [...new Set(steps.map((step) => step.kind))];
  const title =
    kinds.length === 1
      ? `${steps[0].title} (${steps.length} steps)`
      : `Multi-step payment (${steps.length} steps)`;
  return {
    headline: `${prefix}${title}`,
    explanation: steps.map((step) => step.explanation).join(" "),
    primaryKind: primaryKind(steps),
  };
}

function identifyFromTransactionBody(
  input: IdentifyPaymentsInput,
): PaymentIdentification {
  const {transaction, indexerActivities, coinData} = input;
  const connectedWallet = input.connectedWallet
    ? addr(input.connectedWallet)
    : undefined;
  const isUser =
    transaction.type === TransactionTypeName.User ||
    transaction.type === TransactionTypeName.Pending;
  const success =
    "success" in transaction ? Boolean(transaction.success) : true;
  const sender = "sender" in transaction ? addr(transaction.sender) : undefined;
  const functionId = entryFunctionId(transaction);

  if (!isUser) {
    return {
      source: "transaction_body",
      clientTraceAvailable: false,
      success,
      headline: "No payment identified",
      explanation:
        "Payment identification applies to user transactions (including pending).",
      primaryKind: "none",
      involvesConnectedWallet: false,
      steps: [],
      fees: [],
      flow: {nodes: [], edges: []},
    };
  }

  const caSteps = confidentialSteps(transaction, connectedWallet, coinData);
  const swapSteps = exchangeFromEvents(transaction, sender, coinData);
  const payloadSteps = parsePayloadTransfers(transaction, coinData);
  const movements = collectMovements(transaction, indexerActivities);
  const hops = matchHops(movements);
  const hopSteps = hopsToSteps(hops, functionId, sender, coinData);

  // Prefer confidential + exchange + hops. Payload steps fill gaps when events are missing.
  const hasEventTransfers = hopSteps.length > 0 || caSteps.length > 0;
  const transferSteps = hasEventTransfers ? hopSteps : payloadSteps;
  const movementExchange = exchangeFromMovements(
    movements,
    sender,
    coinData,
    swapSteps.length > 0,
  );

  // Drop same-asset hops that are really swap legs (user ↔ pool) once an exchange is identified.
  const swapAssets = new Set(
    [...swapSteps, ...movementExchange].flatMap((step) =>
      [step.amount?.assetId, step.amountOut?.assetId].filter(
        (id): id is string => Boolean(id),
      ),
    ),
  );
  const filteredTransfers = transferSteps.filter((step) => {
    if (step.kind !== "p2p" && step.kind !== "controlled") return true;
    if (swapAssets.size === 0) return true;
    const assetId = step.amount?.assetId;
    return !assetId || !swapAssets.has(assetId);
  });

  let steps = dedupeSteps([
    ...caSteps,
    ...swapSteps,
    ...movementExchange,
    ...filteredTransfers,
  ]);

  // If hops existed AND payload existed and hops were empty of P2P but payload has P2P (pending), already handled.
  if (steps.length === 0 && payloadSteps.length > 0) {
    steps = payloadSteps;
  }

  const partnerFees = steps
    .map((step) => step.partnerFee)
    .filter((fee): fee is PaymentAmount => Boolean(fee));
  const fees = parsePaymentFees(transaction, partnerFees);
  const {
    headline,
    explanation,
    primaryKind: kind,
  } = headlineFor(steps, fees, success);
  const involvesConnectedWallet = steps.some((step) =>
    stepInvolvesWallet(step, connectedWallet),
  );
  const flow = buildFlow(steps, fees);

  return {
    source: "transaction_body",
    clientTraceAvailable: false,
    success,
    headline,
    explanation,
    primaryKind: kind,
    involvesConnectedWallet,
    steps,
    fees,
    flow,
  };
}

export function identifyPayments(
  input: IdentifyPaymentsInput,
): PaymentIdentification {
  const source = input.source ?? "transaction_body";
  if (source === "client_trace") {
    const traced = identifyPaymentsFromClientTrace(input);
    if (traced) return traced;
    const fallback = identifyFromTransactionBody(input);
    return {
      ...fallback,
      source: "client_trace",
      clientTraceAvailable: false,
    };
  }
  return identifyFromTransactionBody(input);
}
