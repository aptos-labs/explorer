import type {Types} from "~/types/aptos";
import {DECIBEL_CONTRACTS} from "./constants";
import type {
  BulkOrderLeg,
  DecibelBulkOrderDetail,
  DecibelBulkOrderFilledEvent,
  DecibelBulkOrderPlacedEvent,
  DecibelDeposit,
  DecibelOrder,
  DecibelTransactionSummary,
  DecibelWithdraw,
} from "./types";

function extractObjectInner(arg: unknown): string {
  if (typeof arg === "object" && arg !== null && "inner" in arg) {
    return (arg as {inner: string}).inner;
  }
  return String(arg);
}

function isDecibelContract(value: string): boolean {
  return DECIBEL_CONTRACTS.some((addr) => value.startsWith(`${addr}::`));
}

export function isDecibelTransaction(transaction: Types.Transaction): boolean {
  if ("events" in transaction && Array.isArray(transaction.events)) {
    for (const event of transaction.events) {
      if (isDecibelContract(event.type)) return true;
    }
  }

  if (
    "payload" in transaction &&
    transaction.payload.type === "entry_function_payload" &&
    "function" in transaction.payload
  ) {
    const payload =
      transaction.payload as Types.TransactionPayload_EntryFunctionPayload;
    if (isDecibelContract(payload.function)) return true;
  }

  return false;
}

function parseOrderEvent(event: Types.Event): DecibelOrder | undefined {
  const isOrderEvent = DECIBEL_CONTRACTS.some(
    (addr) => event.type === `${addr}::market_types::OrderEvent`,
  );
  if (!isOrderEvent) return undefined;

  const data: {
    is_bid: boolean;
    market: string;
    orig_size: string;
    price: string;
    status: {__variant__: string};
    time_in_force: {__variant__: string};
    order_id?: string;
    user?: string;
  } = event.data;

  const statusVariant = data.status?.__variant__ ?? "";
  const tif = data.time_in_force?.__variant__ ?? "";
  const isCancelled =
    statusVariant === "CANCELLED" || statusVariant === "CANCELED";
  const isMarket = tif === "IOC" || tif === "FOK";

  return {
    orderType: isCancelled ? "cancel" : isMarket ? "market" : "limit",
    side: data.is_bid ? "buy" : "sell",
    market: data.market,
    size: data.orig_size,
    price: isCancelled || isMarket ? undefined : data.price,
    status: statusVariant || undefined,
    timeInForce: tif || undefined,
    orderId: typeof data.order_id === "string" ? data.order_id : undefined,
    subaccount: typeof data.user === "string" ? data.user : undefined,
  };
}

function parsePayloadAction(
  transaction: Types.Transaction,
): DecibelOrder | DecibelDeposit | DecibelWithdraw | undefined {
  if (
    !("payload" in transaction) ||
    !("success" in transaction) ||
    !transaction.success
  ) {
    return undefined;
  }

  const payload = transaction.payload;
  if (
    payload.type !== "entry_function_payload" ||
    !("function" in payload) ||
    !("arguments" in payload)
  ) {
    return undefined;
  }

  const typedPayload = payload as Types.TransactionPayload_EntryFunctionPayload;
  const fn = typedPayload.function;
  const args = typedPayload.arguments;

  const matchesDecibel = DECIBEL_CONTRACTS.some((addr) =>
    fn.startsWith(`${addr}::dex_accounts_entry::`),
  );
  if (!matchesDecibel) return undefined;

  const fnName = fn.split("::").pop() ?? "";

  // NOTE: The Aptos API strips the `&signer` argument from entry function
  // payloads, so all arg indices are offset by -1 from the Move function
  // signature (and from the functionArgumentNameOverrides file which
  // includes the signer as arg0).

  // deposit_to_subaccount_at(owner, subaccount, metadata, amount)
  // API args: [subaccount(0), metadata(1), amount(2)]
  if (fnName === "deposit_to_subaccount_at") {
    if (args.length < 3) return undefined;
    return {
      asset: extractObjectInner(args[1]),
      amount: String(args[2]),
      subaccount: extractObjectInner(args[0]),
      functionName: fnName,
    } satisfies DecibelDeposit;
  }

  // deposit_to_isolated_position_collateral(owner, subaccount, market, metadata, amount)
  // API args: [subaccount(0), market(1), metadata(2), amount(3)]
  if (fnName === "deposit_to_isolated_position_collateral") {
    if (args.length < 4) return undefined;
    return {
      asset: extractObjectInner(args[2]),
      amount: String(args[3]),
      subaccount: extractObjectInner(args[0]),
      functionName: fnName,
    } satisfies DecibelDeposit;
  }

  // withdraw_from_subaccount(owner, subaccount, metadata, amount)
  // API args: [subaccount(0), metadata(1), amount(2)]
  if (
    fnName === "withdraw_from_subaccount" ||
    fnName === "withdraw_from_cross_collateral" ||
    fnName === "withdraw_from_non_collateral"
  ) {
    if (args.length < 3) return undefined;
    return {
      asset: extractObjectInner(args[1]),
      amount: String(args[2]),
      subaccount: extractObjectInner(args[0]),
      functionName: fnName,
    } satisfies DecibelWithdraw;
  }

  // withdraw_from_isolated_position_collateral(owner, subaccount, market, metadata, amount)
  // API args: [subaccount(0), market(1), metadata(2), amount(3)]
  if (fnName === "withdraw_from_isolated_position_collateral") {
    if (args.length < 4) return undefined;
    return {
      asset: extractObjectInner(args[2]),
      amount: String(args[3]),
      subaccount: extractObjectInner(args[0]),
      functionName: fnName,
    } satisfies DecibelWithdraw;
  }

  // place_bulk_orders_to_subaccount(auth, subaccount, market, ...)
  // API args: [subaccount(0), market(1), ...]
  if (fnName === "place_bulk_orders_to_subaccount") {
    if (args.length < 2) return undefined;
    return {
      orderType: "bulk",
      side: undefined,
      market: extractObjectInner(args[1]),
      size: undefined,
      price: undefined,
      status: undefined,
      timeInForce: undefined,
      orderId: undefined,
      subaccount: extractObjectInner(args[0]),
    } satisfies DecibelOrder;
  }

  // place_twap_order_to_subaccount(auth, subaccount, market, size, is_buy, ...)
  // API args: [subaccount(0), market(1), size(2), is_buy(3), ...]
  if (
    fnName === "place_twap_order_to_subaccount" ||
    fnName === "place_twap_order_to_subaccount_v2"
  ) {
    if (args.length < 4) return undefined;
    return {
      orderType: "twap",
      side: args[3] === true || args[3] === "true" ? "buy" : "sell",
      market: extractObjectInner(args[1]),
      size: String(args[2]),
      price: undefined,
      status: undefined,
      timeInForce: undefined,
      orderId: undefined,
      subaccount: extractObjectInner(args[0]),
    } satisfies DecibelOrder;
  }

  // cancel_order_to_subaccount(auth, subaccount, order_id, market)
  // cancel_client_order_to_subaccount(auth, subaccount, client_order_id, market)
  // API args: [subaccount(0), order_id(1), market(2)]
  if (
    fnName === "cancel_order_to_subaccount" ||
    fnName === "cancel_client_order_to_subaccount"
  ) {
    if (args.length < 3) return undefined;
    return {
      orderType: "cancel",
      side: undefined,
      market: extractObjectInner(args[2]),
      size: undefined,
      price: undefined,
      status: undefined,
      timeInForce: undefined,
      orderId: String(args[1]),
      subaccount: extractObjectInner(args[0]),
    } satisfies DecibelOrder;
  }

  // cancel_bulk_order_to_subaccount(auth, subaccount, market)
  // cancel_twap_orders_to_subaccount(auth, subaccount, market, order_id)
  // cancel_tp_sl_order_for_position(auth, subaccount, market, order_id)
  // API args: [subaccount(0), market(1), ...]
  if (
    fnName === "cancel_bulk_order_to_subaccount" ||
    fnName === "cancel_twap_orders_to_subaccount" ||
    fnName === "cancel_tp_sl_order_for_position"
  ) {
    if (args.length < 2) return undefined;
    return {
      orderType: "cancel",
      side: undefined,
      market: extractObjectInner(args[1]),
      size: undefined,
      price: undefined,
      status: undefined,
      timeInForce: undefined,
      orderId: args.length >= 3 ? String(args[2]) : undefined,
      subaccount: extractObjectInner(args[0]),
    } satisfies DecibelOrder;
  }

  return undefined;
}

function zipLegs(prices: unknown, sizes: unknown): BulkOrderLeg[] {
  const p = Array.isArray(prices) ? prices : [];
  const s = Array.isArray(sizes) ? sizes : [];
  const len = Math.min(p.length, s.length);
  const legs: BulkOrderLeg[] = [];
  for (let i = 0; i < len; i++) {
    legs.push({
      price: String(p[i]),
      size: String(s[i]),
    });
  }
  return legs;
}

function extractOptionValue(val: unknown): string | undefined {
  if (typeof val === "object" && val !== null && "vec" in val) {
    const vec = (val as {vec: unknown[]}).vec;
    if (vec.length > 0) return String(vec[0]);
    return undefined;
  }
  if (typeof val === "string") return val;
  return undefined;
}

function parseBulkOrderPayloadDetail(
  transaction: Types.Transaction,
): DecibelBulkOrderDetail | undefined {
  if (
    !("payload" in transaction) ||
    !("success" in transaction) ||
    !transaction.success
  ) {
    return undefined;
  }

  const payload = transaction.payload;
  if (
    payload.type !== "entry_function_payload" ||
    !("function" in payload) ||
    !("arguments" in payload)
  ) {
    return undefined;
  }

  const typedPayload = payload as Types.TransactionPayload_EntryFunctionPayload;
  const fn = typedPayload.function;
  const args = typedPayload.arguments;

  const matchesDecibel = DECIBEL_CONTRACTS.some((addr) =>
    fn.startsWith(`${addr}::dex_accounts_entry::`),
  );
  if (!matchesDecibel) return undefined;

  const fnName = fn.split("::").pop() ?? "";
  if (fnName !== "place_bulk_orders_to_subaccount") return undefined;

  // API args (signer stripped): [subaccount(0), market(1), sequence_number(2),
  //   bid_prices(3), bid_sizes(4), ask_prices(5), ask_sizes(6),
  //   builder_address(7), builder_fees(8)]
  if (args.length < 7) return undefined;

  const builderAddr = args.length > 7 ? extractOptionValue(args[7]) : undefined;
  const builderFee = args.length > 8 ? extractOptionValue(args[8]) : undefined;

  return {
    market: extractObjectInner(args[1]),
    subaccount: extractObjectInner(args[0]),
    sequenceNumber: args[2] != null ? String(args[2]) : undefined,
    bids: zipLegs(args[3], args[4]),
    asks: zipLegs(args[5], args[6]),
    builderAddress:
      builderAddr && builderAddr !== "0x0" ? builderAddr : undefined,
    builderFees: builderFee && builderFee !== "0" ? builderFee : undefined,
  };
}

function parseBulkOrderPlacedEvent(
  event: Types.Event,
): DecibelBulkOrderPlacedEvent | undefined {
  const isMatch = DECIBEL_CONTRACTS.some(
    (addr) => event.type === `${addr}::market_types::BulkOrderPlacedEvent`,
  );
  if (!isMatch) return undefined;

  const data = event.data as Record<string, unknown>;
  return {
    market: String(data.market ?? ""),
    orderId: String(data.order_id ?? ""),
    user: String(data.user ?? ""),
    sequenceNumber: String(data.sequence_number ?? ""),
    previousSeqNum:
      data.previous_seq_num !== undefined
        ? String(data.previous_seq_num)
        : undefined,
    bids: zipLegs(data.bid_prices, data.bid_sizes),
    asks: zipLegs(data.ask_prices, data.ask_sizes),
    cancelledBids: zipLegs(data.cancelled_bid_prices, data.cancelled_bid_sizes),
    cancelledAsks: zipLegs(data.cancelled_ask_prices, data.cancelled_ask_sizes),
  };
}

function parseBulkOrderFilledEvent(
  event: Types.Event,
): DecibelBulkOrderFilledEvent | undefined {
  const isMatch = DECIBEL_CONTRACTS.some(
    (addr) => event.type === `${addr}::market_types::BulkOrderFilledEvent`,
  );
  if (!isMatch) return undefined;

  const data = event.data as Record<string, unknown>;
  return {
    market: String(data.market ?? ""),
    orderId: String(data.order_id ?? ""),
    user: String(data.user ?? ""),
    fillId: String(data.fill_id ?? ""),
    side: data.is_bid === true ? "buy" : "sell",
    price: String(data.price ?? ""),
    origPrice: data.orig_price != null ? String(data.orig_price) : undefined,
    filledSize: String(data.filled_size ?? ""),
  };
}

export function parseDecibelTransaction(
  transaction: Types.Transaction,
): DecibelTransactionSummary {
  const orders: DecibelOrder[] = [];
  const deposits: DecibelDeposit[] = [];
  const withdrawals: DecibelWithdraw[] = [];
  const bulkOrderPlacedEvents: DecibelBulkOrderPlacedEvent[] = [];
  const bulkOrderFilledEvents: DecibelBulkOrderFilledEvent[] = [];

  // Parse events for order data and bulk-specific events
  if ("events" in transaction && Array.isArray(transaction.events)) {
    for (const event of transaction.events) {
      const order = parseOrderEvent(event);
      if (order) {
        orders.push(order);
        continue;
      }

      const placed = parseBulkOrderPlacedEvent(event);
      if (placed) {
        bulkOrderPlacedEvents.push(placed);
        continue;
      }

      const filled = parseBulkOrderFilledEvent(event);
      if (filled) {
        bulkOrderFilledEvents.push(filled);
      }
    }
  }

  // Parse payload for deposit/withdraw/order actions
  const payloadAction = parsePayloadAction(transaction);
  if (payloadAction) {
    if ("orderType" in payloadAction) {
      // Merge payload data (orderId, subaccount) into event-parsed orders
      // rather than creating a duplicate entry
      if (orders.length > 0) {
        for (const order of orders) {
          if (!order.orderId && payloadAction.orderId) {
            order.orderId = payloadAction.orderId;
          }
          if (!order.subaccount && payloadAction.subaccount) {
            order.subaccount = payloadAction.subaccount;
          }
        }
      } else {
        orders.push(payloadAction);
      }
    } else if ("functionName" in payloadAction) {
      if (payloadAction.functionName.startsWith("deposit")) {
        deposits.push(payloadAction as DecibelDeposit);
      } else {
        withdrawals.push(payloadAction as DecibelWithdraw);
      }
    }
  }

  // Parse bulk order detail from payload arguments
  const bulkOrderDetail = parseBulkOrderPayloadDetail(transaction);

  return {
    orders,
    deposits,
    withdrawals,
    bulkOrderDetail,
    bulkOrderPlacedEvents,
    bulkOrderFilledEvents,
  };
}
