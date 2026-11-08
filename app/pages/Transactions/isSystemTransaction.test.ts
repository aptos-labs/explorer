import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {isSystemTransaction} from "./isSystemTransaction";

function txn(type: string): Types.Transaction {
  return {type} as Types.Transaction;
}

describe("FEAT-TXLIST-003 — isSystemTransaction", () => {
  it.each([
    "genesis_transaction",
    "block_metadata_transaction",
    "state_checkpoint_transaction",
    "block_epilogue_transaction",
    "validator_transaction",
  ])("treats %s as a system transaction", (type) => {
    expect(isSystemTransaction(txn(type))).toBe(true);
  });

  it("does not treat user or pending transactions as system", () => {
    expect(isSystemTransaction(txn("user_transaction"))).toBe(false);
    // Pending transactions lack gas_used but are user-submitted.
    expect(isSystemTransaction(txn("pending_transaction"))).toBe(false);
  });

  it("does not treat an unrecognized type as system", () => {
    expect(isSystemTransaction(txn("future_transaction"))).toBe(false);
  });
});
