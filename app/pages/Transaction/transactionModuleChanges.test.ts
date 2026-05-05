// Covers FEAT-TXN-012 — transaction module / package summary parsing
import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {
  getTransactionModuleSummary,
  PUBLISH_PACKAGE_EVENT_TYPE_SUFFIX,
  transactionHasModuleSummary,
} from "./transactionModuleChanges";

function userTxn(
  partial: Partial<Types.Transaction_UserTransaction>,
): Types.Transaction_UserTransaction {
  return {
    type: "user_transaction",
    version: "1",
    hash: "0xabc",
    state_change_hash: "0x",
    event_root_hash: "0x",
    state_checkpoint_hash: null,
    gas_used: "0",
    success: true,
    vm_status: "Executed successfully",
    accumulator_root_hash: "0x",
    changes: [],
    sender: "0xa",
    sequence_number: "0",
    max_gas_amount: "0",
    gas_unit_price: "0",
    expiration_timestamp_secs: "0",
    payload: {
      type: "entry_function_payload",
      function: "0x1::a::b",
      type_arguments: [],
      arguments: [],
    },
    events: [],
    timestamp: "0",
    ...partial,
  };
}

describe("FEAT-TXN-012 — getTransactionModuleSummary", () => {
  it("returns null when there are no publish events and no module write-set rows", () => {
    const txn = userTxn({
      changes: [
        {
          type: "write_resource",
          address: "0x1",
          state_key_hash: "0x",
          data: {type: "0x1::account::Account", data: {}},
        },
      ],
      events: [
        {
          guid: {creation_number: "0", account_address: "0x1"},
          sequence_number: "1",
          type: "0x1::coin::DepositEvent",
          data: {},
        },
      ],
    });
    expect(getTransactionModuleSummary(txn)).toBeNull();
    expect(transactionHasModuleSummary(txn)).toBe(false);
  });

  it("collects write_module rows with ABI module names", () => {
    const txn = userTxn({
      changes: [
        {
          type: "write_module",
          address: "0xbeef",
          state_key_hash: "0x",
          data: {
            bytecode: "0x",
            abi: {
              address: "0xbeef",
              name: "my_module",
              friends: [],
              exposed_functions: [],
              structs: [],
            },
          },
        },
      ],
    });
    const s = getTransactionModuleSummary(txn);
    expect(s).not.toBeNull();
    expect(s?.moduleChanges).toEqual([
      {kind: "write_module", address: "0xbeef", moduleName: "my_module"},
    ]);
    expect(s?.publishPackageEvents).toEqual([]);
  });

  it("uses a placeholder when write_module has no ABI name", () => {
    const txn = userTxn({
      changes: [
        {
          type: "write_module",
          address: "0xbeef",
          state_key_hash: "0x",
          data: {bytecode: "0x"},
        },
      ],
    });
    expect(
      getTransactionModuleSummary(txn)?.moduleChanges[0]?.moduleName,
    ).toBe("(module name unavailable)");
  });

  it("collects delete_module rows", () => {
    const txn = userTxn({
      changes: [
        {
          type: "delete_module",
          address: "0xdead",
          state_key_hash: "0x",
          module: "gone",
        },
      ],
    });
    expect(getTransactionModuleSummary(txn)?.moduleChanges).toEqual([
      {kind: "delete_module", address: "0xdead", moduleName: "gone"},
    ]);
  });

  it("parses PublishPackage events by type suffix and snake_case fields", () => {
    const txn = userTxn({
      changes: [],
      events: [
        {
          guid: {creation_number: "0", account_address: "0x0"},
          sequence_number: "0",
          type: `0x0000000000000000000000000000000000000000000000000000000000000001${PUBLISH_PACKAGE_EVENT_TYPE_SUFFIX}`,
          data: {
            code_address:
              "0x0000000000000000000000000000000000000000000000000000000000cafe",
            is_upgrade: true,
          },
        },
      ],
    });
    const s = getTransactionModuleSummary(txn);
    expect(s?.publishPackageEvents).toEqual([
      {
        codeAddress:
          "0x0000000000000000000000000000000000000000000000000000000000cafe",
        isUpgrade: true,
      },
    ]);
  });

  it("treats string is_upgrade truthy values as upgrade", () => {
    const txn = userTxn({
      events: [
        {
          guid: {creation_number: "0", account_address: "0x0"},
          sequence_number: "0",
          type: `0x1${PUBLISH_PACKAGE_EVENT_TYPE_SUFFIX}`,
          data: {code_address: "0x2", is_upgrade: "true"},
        },
      ],
    });
    expect(
      getTransactionModuleSummary(txn)?.publishPackageEvents?.[0]?.isUpgrade,
    ).toBe(true);
  });
});
