import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {detectRefsInTransaction, scanForRefs} from "./useGetObjectRefs";

const OBJECT_ADDR =
  "0x0000000000000000000000000000000000000000000000000000000000000abc";

describe("scanForRefs", () => {
  it("detects transfer_ref with direct field", () => {
    const data = {
      transfer_ref: {self: OBJECT_ADDR},
    };
    const result = scanForRefs(data, OBJECT_ADDR, []);
    expect(result.has("transfer")).toBe(true);
    expect(result.has("delete")).toBe(false);
    expect(result.has("extend")).toBe(false);
  });

  it("detects delete_ref with direct field", () => {
    const data = {
      delete_ref: {self: OBJECT_ADDR},
    };
    const result = scanForRefs(data, OBJECT_ADDR, []);
    expect(result.has("delete")).toBe(true);
  });

  it("detects extend_ref with direct field", () => {
    const data = {
      extend_ref: {self: OBJECT_ADDR},
    };
    const result = scanForRefs(data, OBJECT_ADDR, []);
    expect(result.has("extend")).toBe(true);
  });

  it("detects ref wrapped in Option (non-empty vec)", () => {
    const data = {
      transfer_ref: {vec: [{self: OBJECT_ADDR}]},
    };
    const result = scanForRefs(data, OBJECT_ADDR, []);
    expect(result.has("transfer")).toBe(true);
  });

  it("does not detect ref in empty Option (empty vec)", () => {
    const data = {
      transfer_ref: {vec: []},
    };
    const result = scanForRefs(data, OBJECT_ADDR, []);
    expect(result.size).toBe(0);
  });

  it("does not match when address differs", () => {
    const data = {
      transfer_ref: {
        self: "0x0000000000000000000000000000000000000000000000000000000000000def",
      },
    };
    const result = scanForRefs(data, OBJECT_ADDR, []);
    expect(result.size).toBe(0);
  });

  it("detects multiple refs in same resource", () => {
    const data = {
      transfer_ref: {self: OBJECT_ADDR},
      delete_ref: {self: OBJECT_ADDR},
      extend_ref: {self: OBJECT_ADDR},
    };
    const result = scanForRefs(data, OBJECT_ADDR, []);
    expect(result.has("transfer")).toBe(true);
    expect(result.has("delete")).toBe(true);
    expect(result.has("extend")).toBe(true);
  });

  it("detects DeleteRef inside AptosToken BurnRef.self pattern", () => {
    const data = {
      burn_ref: {
        vec: [
          {
            inner: {vec: [{self: OBJECT_ADDR}]},
            self: {vec: [{self: OBJECT_ADDR}]},
          },
        ],
      },
    };
    const result = scanForRefs(data, OBJECT_ADDR, []);
    expect(result.has("delete")).toBe(true);
  });

  it("does not detect DeleteRef when BurnRef.self is empty but inner exists", () => {
    const data = {
      burn_ref: {
        vec: [
          {
            inner: {vec: [{self: OBJECT_ADDR}]},
            self: {vec: []},
          },
        ],
      },
    };
    const result = scanForRefs(data, OBJECT_ADDR, []);
    expect(result.has("delete")).toBe(false);
  });

  it("handles null and undefined values", () => {
    expect(scanForRefs(null, OBJECT_ADDR, []).size).toBe(0);
    expect(scanForRefs(undefined, OBJECT_ADDR, []).size).toBe(0);
    expect(scanForRefs("string", OBJECT_ADDR, []).size).toBe(0);
    expect(scanForRefs(42, OBJECT_ADDR, []).size).toBe(0);
  });

  it("detects ref with short-form address (auto-standardized)", () => {
    const data = {
      extend_ref: {self: "0xabc"},
    };
    const result = scanForRefs(data, OBJECT_ADDR, []);
    expect(result.has("extend")).toBe(true);
  });
});

describe("detectRefsInTransaction", () => {
  function makeWriteResource(
    address: string,
    resourceType: string,
    data: unknown,
  ): Types.WriteSetChange {
    return {
      type: "write_resource",
      address,
      state_key_hash: "0x0",
      data: {type: resourceType, data},
    };
  }

  function makeCreateResource(
    address: string,
    resourceType: string,
    data: unknown,
  ): Types.WriteSetChange {
    return {
      type: "create_resource",
      address,
      state_key_hash: "0x0",
      data: {type: resourceType, data},
    };
  }

  function makeTx(
    changes: Types.WriteSetChange[],
  ): Types.Transaction_UserTransaction {
    return {
      type: "user_transaction",
      version: "1",
      hash: "0x1",
      state_change_hash: "0x1",
      event_root_hash: "0x1",
      state_checkpoint_hash: null,
      gas_used: "0",
      success: true,
      vm_status: "Executed successfully",
      accumulator_root_hash: "0x1",
      changes,
      sender: "0x1",
      sequence_number: "0",
      max_gas_amount: "100000",
      gas_unit_price: "100",
      expiration_timestamp_secs: "99999999",
      payload: {
        type: "entry_function_payload",
        function: "0x1::test::test",
        type_arguments: [],
        arguments: [],
      },
      events: [],
      timestamp: "0",
    };
  }

  it("detects refs from write_resource changes", () => {
    const tx = makeTx([
      makeWriteResource("0x999", "0x1::test::Refs", {
        transfer_ref: {self: OBJECT_ADDR},
        extend_ref: {self: OBJECT_ADDR},
      }),
    ]);
    const result = detectRefsInTransaction(tx, OBJECT_ADDR);
    expect(result.hasTransferRef).toBe(true);
    expect(result.hasDeleteRef).toBe(false);
    expect(result.hasExtendRef).toBe(true);
  });

  it("detects refs from create_resource changes", () => {
    const tx = makeTx([
      makeCreateResource(OBJECT_ADDR, "0x1::test::Refs", {
        delete_ref: {vec: [{self: OBJECT_ADDR}]},
      }),
    ]);
    const result = detectRefsInTransaction(tx, OBJECT_ADDR);
    expect(result.hasDeleteRef).toBe(true);
  });

  it("ignores non-resource changes", () => {
    const change: Types.WriteSetChange = {
      type: "write_table_item",
      state_key_hash: "0x0",
      handle: "0x1",
      key: "0x1",
      value: "0x1",
    };
    const tx = makeTx([change]);
    const result = detectRefsInTransaction(tx, OBJECT_ADDR);
    expect(result.hasTransferRef).toBe(false);
  });

  it("returns all false for transaction without changes", () => {
    const tx = {type: "pending_transaction"} as Types.Transaction;
    const result = detectRefsInTransaction(tx, OBJECT_ADDR);
    expect(result.hasTransferRef).toBe(false);
    expect(result.hasDeleteRef).toBe(false);
    expect(result.hasExtendRef).toBe(false);
  });

  it("handles real-world ANS DomainObject pattern", () => {
    const tx = makeTx([
      makeWriteResource(OBJECT_ADDR, "0x867ed::v2_1_domains::DomainObject", {
        extend_ref: {self: OBJECT_ADDR},
      }),
    ]);
    const result = detectRefsInTransaction(tx, OBJECT_ADDR);
    expect(result.hasTransferRef).toBe(false);
    expect(result.hasDeleteRef).toBe(false);
    expect(result.hasExtendRef).toBe(true);
  });

  it("aggregates refs from multiple changes", () => {
    const tx = makeTx([
      makeWriteResource("0x1", "0x1::a::A", {
        transfer_ref: {self: OBJECT_ADDR},
      }),
      makeWriteResource("0x2", "0x1::b::B", {
        extend_ref: {self: OBJECT_ADDR},
      }),
    ]);
    const result = detectRefsInTransaction(tx, OBJECT_ADDR);
    expect(result.hasTransferRef).toBe(true);
    expect(result.hasExtendRef).toBe(true);
  });
});
