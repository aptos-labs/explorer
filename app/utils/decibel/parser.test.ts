import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {DECIBEL_CONTRACTS} from "./constants";
import {isDecibelTransaction, parseDecibelTransaction} from "./parser";

const MAINNET_CONTRACT = DECIBEL_CONTRACTS[0];
const TESTNET_CONTRACT = DECIBEL_CONTRACTS[1];

function makeUserTxn(
  overrides: Partial<{
    events: Types.Event[];
    payload: Record<string, unknown>;
    success: boolean;
  }> = {},
): Types.Transaction {
  return {
    type: "user_transaction",
    success: true,
    events: [],
    payload: {type: "entry_function_payload", function: "", arguments: []},
    ...overrides,
  } as unknown as Types.Transaction;
}

describe("isDecibelTransaction", () => {
  it("returns true when events contain a Decibel event type (mainnet)", () => {
    const txn = makeUserTxn({
      events: [
        {
          type: `${MAINNET_CONTRACT}::market_types::OrderEvent`,
          data: {},
        } as unknown as Types.Event,
      ],
    });
    expect(isDecibelTransaction(txn)).toBe(true);
  });

  it("returns true when events contain a Decibel event type (testnet)", () => {
    const txn = makeUserTxn({
      events: [
        {
          type: `${TESTNET_CONTRACT}::market_types::OrderEvent`,
          data: {},
        } as unknown as Types.Event,
      ],
    });
    expect(isDecibelTransaction(txn)).toBe(true);
  });

  it("returns true when payload function targets Decibel", () => {
    const txn = makeUserTxn({
      payload: {
        type: "entry_function_payload",
        function: `${MAINNET_CONTRACT}::dex_accounts_entry::deposit_to_subaccount_at`,
        arguments: [],
      },
    });
    expect(isDecibelTransaction(txn)).toBe(true);
  });

  it("returns false for non-Decibel transactions", () => {
    const txn = makeUserTxn({
      events: [
        {
          type: "0xabc::some_module::SomeEvent",
          data: {},
        } as unknown as Types.Event,
      ],
      payload: {
        type: "entry_function_payload",
        function: "0xabc::some_module::some_function",
        arguments: [],
      },
    });
    expect(isDecibelTransaction(txn)).toBe(false);
  });

  it("returns false for transactions without events or payload", () => {
    const txn = {type: "state_checkpoint_transaction"} as Types.Transaction;
    expect(isDecibelTransaction(txn)).toBe(false);
  });
});

describe("parseDecibelTransaction", () => {
  describe("orders", () => {
    it("parses a limit order from OrderEvent", () => {
      const txn = makeUserTxn({
        events: [
          {
            type: `${MAINNET_CONTRACT}::market_types::OrderEvent`,
            data: {
              is_bid: true,
              market: "0xmarket1",
              orig_size: "1000",
              price: "5000",
              status: {__variant__: "FILLED"},
              time_in_force: {__variant__: "GTC"},
            },
          } as unknown as Types.Event,
        ],
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.orders).toHaveLength(1);
      expect(summary.orders[0]).toMatchObject({
        orderType: "limit",
        side: "buy",
        market: "0xmarket1",
        size: "1000",
        price: "5000",
        status: "FILLED",
        timeInForce: "GTC",
      });
    });

    it("parses a market order (IOC time-in-force)", () => {
      const txn = makeUserTxn({
        events: [
          {
            type: `${MAINNET_CONTRACT}::market_types::OrderEvent`,
            data: {
              is_bid: false,
              market: "0xmarket2",
              orig_size: "500",
              price: "3000",
              status: {__variant__: "FILLED"},
              time_in_force: {__variant__: "IOC"},
            },
          } as unknown as Types.Event,
        ],
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.orders[0].orderType).toBe("market");
      expect(summary.orders[0].side).toBe("sell");
      expect(summary.orders[0].price).toBeUndefined();
    });

    it("parses a cancelled order", () => {
      const txn = makeUserTxn({
        events: [
          {
            type: `${MAINNET_CONTRACT}::market_types::OrderEvent`,
            data: {
              is_bid: true,
              market: "0xmarket1",
              orig_size: "100",
              price: "2000",
              status: {__variant__: "CANCELLED"},
              time_in_force: {__variant__: "GTC"},
            },
          } as unknown as Types.Event,
        ],
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.orders[0].orderType).toBe("cancel");
      expect(summary.orders[0].price).toBeUndefined();
    });

    it("parses bulk order from payload", () => {
      const txn = makeUserTxn({
        payload: {
          type: "entry_function_payload",
          function: `${MAINNET_CONTRACT}::dex_accounts_entry::place_bulk_orders_to_subaccount`,
          arguments: ["sub1", {inner: "0xmarket1"}, "data"],
        },
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.orders).toHaveLength(1);
      expect(summary.orders[0].orderType).toBe("bulk");
      expect(summary.orders[0].market).toBe("0xmarket1");
    });

    it("parses twap order from payload", () => {
      // API args (signer stripped): [subaccount, market, size, is_buy, ...]
      const txn = makeUserTxn({
        payload: {
          type: "entry_function_payload",
          function: `${MAINNET_CONTRACT}::dex_accounts_entry::place_twap_order_to_subaccount`,
          arguments: [
            {inner: "sub1"},
            {inner: "0xmarket1"},
            "500",
            "true",
            "false",
            "60",
            "3600",
            "0x0",
            "0",
          ],
        },
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.orders[0].orderType).toBe("twap");
      expect(summary.orders[0].side).toBe("buy");
      expect(summary.orders[0].size).toBe("500");
    });

    it("parses cancel_order_to_subaccount from payload", () => {
      // API args (signer stripped): [subaccount, order_id, market]
      const txn = makeUserTxn({
        payload: {
          type: "entry_function_payload",
          function: `${MAINNET_CONTRACT}::dex_accounts_entry::cancel_order_to_subaccount`,
          arguments: [
            {
              inner:
                "0x418abee2561e6eae64b826b152eccbd1b0781693b5d9a7ef12c96f2ce03fe607",
            },
            "170141599249866109911302405644884115456",
            {
              inner:
                "0xd62d10d1ef0cbe2103b5bd479691ac38222a85140fcbe7c2dc66ed23bdef58ae",
            },
          ],
        },
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.orders).toHaveLength(1);
      expect(summary.orders[0].orderType).toBe("cancel");
      expect(summary.orders[0].market).toBe(
        "0xd62d10d1ef0cbe2103b5bd479691ac38222a85140fcbe7c2dc66ed23bdef58ae",
      );
      expect(summary.orders[0].orderId).toBe(
        "170141599249866109911302405644884115456",
      );
      expect(summary.orders[0].subaccount).toBe(
        "0x418abee2561e6eae64b826b152eccbd1b0781693b5d9a7ef12c96f2ce03fe607",
      );
    });

    it("merges event and payload data for cancel orders", () => {
      // Real scenario: event has side/size/status, payload has orderId/subaccount
      const txn = makeUserTxn({
        events: [
          {
            type: `${MAINNET_CONTRACT}::market_types::OrderEvent`,
            data: {
              is_bid: true,
              market:
                "0xd62d10d1ef0cbe2103b5bd479691ac38222a85140fcbe7c2dc66ed23bdef58ae",
              orig_size: "2000000",
              price: "89850",
              status: {__variant__: "CANCELLED"},
              time_in_force: {__variant__: "GTC"},
            },
          } as unknown as Types.Event,
        ],
        payload: {
          type: "entry_function_payload",
          function: `${MAINNET_CONTRACT}::dex_accounts_entry::cancel_order_to_subaccount`,
          arguments: [
            {
              inner:
                "0x418abee2561e6eae64b826b152eccbd1b0781693b5d9a7ef12c96f2ce03fe607",
            },
            "170141599249866109911302405644884115456",
            {
              inner:
                "0xd62d10d1ef0cbe2103b5bd479691ac38222a85140fcbe7c2dc66ed23bdef58ae",
            },
          ],
        },
      });
      const summary = parseDecibelTransaction(txn);
      // Should produce ONE merged order, not two
      expect(summary.orders).toHaveLength(1);
      const order = summary.orders[0];
      // From event
      expect(order.side).toBe("buy");
      expect(order.size).toBe("2000000");
      expect(order.status).toBe("CANCELLED");
      expect(order.timeInForce).toBe("GTC");
      // From payload (merged in)
      expect(order.orderId).toBe("170141599249866109911302405644884115456");
      expect(order.subaccount).toBe(
        "0x418abee2561e6eae64b826b152eccbd1b0781693b5d9a7ef12c96f2ce03fe607",
      );
    });
  });

  describe("deposits", () => {
    it("parses deposit_to_subaccount_at", () => {
      const txn = makeUserTxn({
        payload: {
          type: "entry_function_payload",
          function: `${MAINNET_CONTRACT}::dex_accounts_entry::deposit_to_subaccount_at`,
          arguments: ["sub1", {inner: "0xasset1"}, "1000000"],
        },
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.deposits).toHaveLength(1);
      expect(summary.deposits[0]).toEqual({
        asset: "0xasset1",
        amount: "1000000",
        subaccount: "sub1",
        functionName: "deposit_to_subaccount_at",
      });
    });

    it("parses deposit_to_isolated_position_collateral", () => {
      // API args (signer stripped): [subaccount, market, metadata, amount]
      const txn = makeUserTxn({
        payload: {
          type: "entry_function_payload",
          function: `${MAINNET_CONTRACT}::dex_accounts_entry::deposit_to_isolated_position_collateral`,
          arguments: [
            {inner: "sub1"},
            {inner: "0xmarket1"},
            {inner: "0xasset1"},
            "2000000",
          ],
        },
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.deposits).toHaveLength(1);
      expect(summary.deposits[0].subaccount).toBe("sub1");
      expect(summary.deposits[0].asset).toBe("0xasset1");
      expect(summary.deposits[0].amount).toBe("2000000");
    });
  });

  describe("withdrawals", () => {
    it("parses withdraw_from_subaccount", () => {
      // API args (signer stripped): [subaccount, metadata, amount]
      const txn = makeUserTxn({
        payload: {
          type: "entry_function_payload",
          function: `${MAINNET_CONTRACT}::dex_accounts_entry::withdraw_from_subaccount`,
          arguments: [{inner: "sub1"}, {inner: "0xasset1"}, "500000"],
        },
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.withdrawals).toHaveLength(1);
      expect(summary.withdrawals[0]).toEqual({
        asset: "0xasset1",
        amount: "500000",
        subaccount: "sub1",
        functionName: "withdraw_from_subaccount",
      });
    });

    it("parses withdraw_from_cross_collateral", () => {
      // API args (signer stripped): [subaccount, metadata, amount]
      const txn = makeUserTxn({
        payload: {
          type: "entry_function_payload",
          function: `${MAINNET_CONTRACT}::dex_accounts_entry::withdraw_from_cross_collateral`,
          arguments: [{inner: "sub1"}, {inner: "0xasset2"}, "300000"],
        },
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.withdrawals).toHaveLength(1);
      expect(summary.withdrawals[0].functionName).toBe(
        "withdraw_from_cross_collateral",
      );
    });
  });

  describe("edge cases", () => {
    it("returns empty summary for non-Decibel transaction", () => {
      const txn = makeUserTxn({
        events: [
          {type: "0xabc::module::Event", data: {}} as unknown as Types.Event,
        ],
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.orders).toHaveLength(0);
      expect(summary.deposits).toHaveLength(0);
      expect(summary.withdrawals).toHaveLength(0);
    });

    it("skips payload parsing for failed transactions", () => {
      const txn = makeUserTxn({
        success: false,
        payload: {
          type: "entry_function_payload",
          function: `${MAINNET_CONTRACT}::dex_accounts_entry::deposit_to_subaccount_at`,
          arguments: ["sub1", {inner: "0xasset1"}, "1000000"],
        },
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.deposits).toHaveLength(0);
    });

    it("returns empty for cancel with insufficient args", () => {
      const txn = makeUserTxn({
        payload: {
          type: "entry_function_payload",
          function: `${MAINNET_CONTRACT}::dex_accounts_entry::cancel_order_to_subaccount`,
          arguments: [{inner: "sub1"}],
        },
      });
      const summary = parseDecibelTransaction(txn);
      expect(summary.orders).toHaveLength(0);
    });

    it("handles transaction with no events array", () => {
      const txn = {type: "user_transaction"} as Types.Transaction;
      const summary = parseDecibelTransaction(txn);
      expect(summary.orders).toHaveLength(0);
      expect(summary.deposits).toHaveLength(0);
      expect(summary.withdrawals).toHaveLength(0);
    });
  });
});
