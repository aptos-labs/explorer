import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {
  encryptedStateLabel,
  extractDisplayableEntryFunctionPayload,
  formatClaimedEntryFunction,
  isEncryptedTransactionPayload,
} from "./transactionPayload";

// Covers FEAT-TXN-002 / FEAT-TXN-005 — encrypted transaction payload helpers.

const ENTRY: Types.TransactionPayload_EntryFunctionPayload = {
  type: "entry_function_payload",
  function: "0x1::coin::transfer",
  type_arguments: ["0x1::aptos_coin::AptosCoin"],
  arguments: ["0xreceiver", "1"],
};

function makeTxn(
  payload: Types.TransactionPayload,
): Types.Transaction_UserTransaction {
  return {
    type: "user_transaction",
    version: "1",
    hash: "0xhash",
    state_change_hash: "0x",
    event_root_hash: "0x",
    state_checkpoint_hash: null,
    gas_used: "1",
    success: true,
    vm_status: "Executed successfully",
    accumulator_root_hash: "0x",
    changes: [],
    sender: "0xsender",
    sequence_number: "0",
    max_gas_amount: "1000",
    gas_unit_price: "200",
    expiration_timestamp_secs: "0",
    payload,
    events: [],
    timestamp: "0",
  };
}

describe("isEncryptedTransactionPayload", () => {
  it("narrows encrypted payloads", () => {
    const payload: Types.TransactionPayload = {
      type: "encrypted_transaction_payload",
      payload_hash: "0xhash",
      ciphertext: "0xcipher",
      encrypted_state: "encrypted",
    };
    expect(isEncryptedTransactionPayload(payload)).toBe(true);
    expect(isEncryptedTransactionPayload(ENTRY)).toBe(false);
  });
});

describe("formatClaimedEntryFunction", () => {
  it("formats module and optional name", () => {
    expect(
      formatClaimedEntryFunction({
        module: "0x1::coin",
        name: "transfer",
      }),
    ).toBe("0x1::coin::transfer");
    expect(formatClaimedEntryFunction({module: "0x1::coin"})).toBe("0x1::coin");
    expect(formatClaimedEntryFunction(null)).toBeUndefined();
    expect(formatClaimedEntryFunction(undefined)).toBeUndefined();
  });
});

describe("encryptedStateLabel", () => {
  it("returns human-readable labels", () => {
    expect(encryptedStateLabel("decrypted")).toBe("Decrypted");
    expect(encryptedStateLabel("failed_decryption")).toBe("Decryption failed");
    expect(encryptedStateLabel("encrypted")).toBe("Encrypted");
  });
});

describe("extractDisplayableEntryFunctionPayload", () => {
  it("returns direct and multisig entry functions", () => {
    expect(extractDisplayableEntryFunctionPayload(makeTxn(ENTRY))).toEqual(
      ENTRY,
    );
    expect(
      extractDisplayableEntryFunctionPayload(
        makeTxn({
          type: "multisig_payload",
          multisig_address: "0xms",
          transaction_payload: ENTRY,
        }),
      ),
    ).toEqual(ENTRY);
  });

  it("returns the fullnode-decrypted inner entry function", () => {
    expect(
      extractDisplayableEntryFunctionPayload(
        makeTxn({
          type: "encrypted_transaction_payload",
          payload_hash: "0xhash",
          ciphertext: "0xcipher",
          encryption_epoch: "34294",
          encrypted_state: "decrypted",
          decryption_nonce: "0xnonce",
          decrypted_payload: ENTRY,
        }),
      ),
    ).toEqual(ENTRY);
  });

  it("ignores encrypted and failed_decryption states", () => {
    expect(
      extractDisplayableEntryFunctionPayload(
        makeTxn({
          type: "encrypted_transaction_payload",
          payload_hash: "0xhash",
          ciphertext: "0xcipher",
          encrypted_state: "encrypted",
          claimed_entry_fun: {module: "0x1::coin", name: "transfer"},
        }),
      ),
    ).toBeUndefined();
    expect(
      extractDisplayableEntryFunctionPayload(
        makeTxn({
          type: "encrypted_transaction_payload",
          payload_hash: "0xhash",
          ciphertext: "0xcipher",
          encrypted_state: "failed_decryption",
          decryption_failure_reason: "bad ciphertext",
        }),
      ),
    ).toBeUndefined();
  });

  it("rejects malformed decrypted_payload shapes", () => {
    expect(
      extractDisplayableEntryFunctionPayload(
        makeTxn({
          type: "encrypted_transaction_payload",
          payload_hash: "0xhash",
          ciphertext: "0xcipher",
          encrypted_state: "decrypted",
          decryption_nonce: "0xnonce",
          decrypted_payload: {
            type: "entry_function_payload",
            function: "0x1::coin::transfer",
            type_arguments: "not-an-array" as never,
            arguments: [],
          },
        }),
      ),
    ).toBeUndefined();
  });
});
