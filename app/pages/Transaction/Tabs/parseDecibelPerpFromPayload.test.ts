// Covers FEAT-TXN-002 — Overview Actions Decibel bulk with_repricing recognition
import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {parseDecibelPerpFromPayload} from "./UserTransactionOverviewTab";

const MAINNET =
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06";

function makeTxn(
  fn: string,
  args: unknown[],
): Types.Transaction_UserTransaction {
  return {
    type: "user_transaction",
    version: "1",
    hash: "0x1",
    state_change_hash: "0x0",
    event_root_hash: "0x0",
    state_checkpoint_hash: null,
    gas_used: "1",
    success: true,
    vm_status: "Executed successfully",
    accumulator_root_hash: "0x0",
    changes: [],
    sender: "0x1",
    sequence_number: "1",
    max_gas_amount: "1",
    gas_unit_price: "1",
    expiration_timestamp_secs: "0",
    payload: {
      type: "entry_function_payload",
      function: fn,
      type_arguments: [],
      arguments: args,
    },
    signature: {
      type: "ed25519_signature",
      public_key: "0x1",
      signature: "0x1",
    },
    events: [],
    timestamp: "0",
  };
}

describe("parseDecibelPerpFromPayload — bulk with_repricing", () => {
  it("recognizes place_bulk_orders_to_subaccount_with_repricing as bulk", () => {
    const result = parseDecibelPerpFromPayload(
      makeTxn(
        `${MAINNET}::dex_accounts_entry::place_bulk_orders_to_subaccount_with_repricing`,
        [
          {inner: "0xsub1"},
          {inner: "0xmarket1"},
          "1",
          ["5000"],
          ["100"],
          ["5100"],
          ["150"],
          {vec: []},
          {vec: []},
          {vec: ["126040000"]},
        ],
      ),
    );
    expect(result).toEqual({
      actionType: "perp order",
      dex: MAINNET,
      orderType: "bulk",
      side: undefined,
      market: "0xmarket1",
      size: undefined,
      price: undefined,
    });
  });

  it("still recognizes plain place_bulk_orders_to_subaccount", () => {
    const result = parseDecibelPerpFromPayload(
      makeTxn(
        `${MAINNET}::dex_accounts_entry::place_bulk_orders_to_subaccount`,
        [{inner: "0xsub1"}, {inner: "0xmarket1"}],
      ),
    );
    expect(result?.actionType).toBe("perp order");
    if (result?.actionType === "perp order") {
      expect(result.orderType).toBe("bulk");
    }
  });
});
