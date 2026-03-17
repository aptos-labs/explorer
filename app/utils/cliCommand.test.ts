import {describe, expect, it} from "vitest";
import {extractEntryFunctionPayload, generateCliCommand} from "./cliCommand";

describe("generateCliCommand", () => {
  it("generates a basic command with function-id only", () => {
    const payload = {
      type: "entry_function_payload" as const,
      function: "0x1::aptos_account::create_account",
      type_arguments: [],
      arguments: [],
    };

    const result = generateCliCommand(payload);
    expect(result).toContain("aptos move run");
    expect(result).toContain(
      "--function-id '0x1::aptos_account::create_account'",
    );
    expect(result).not.toContain("--type-args");
    expect(result).not.toContain("--args");
  });

  it("generates a command with type arguments", () => {
    const payload = {
      type: "entry_function_payload" as const,
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: ["0xabc123", "1000"],
    };

    const result = generateCliCommand(payload, ["&signer", "address", "u64"]);
    expect(result).toContain("--function-id '0x1::coin::transfer'");
    expect(result).toContain("--type-args '0x1::aptos_coin::AptosCoin'");
    expect(result).toContain("'address:0xabc123'");
    expect(result).toContain("'u64:1000'");
  });

  it("filters out signer params from argument types", () => {
    const payload = {
      type: "entry_function_payload" as const,
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: ["0xabc123", "1000"],
    };

    const result = generateCliCommand(payload, ["signer", "address", "u64"]);
    expect(result).toContain("'address:0xabc123'");
    expect(result).toContain("'u64:1000'");
    expect(result).not.toContain("signer:");
  });

  it("handles object arguments", () => {
    const payload = {
      type: "entry_function_payload" as const,
      function: "0x1::some_module::some_function",
      type_arguments: [],
      arguments: [{inner: "0xabc"}],
    };

    const result = generateCliCommand(payload, ["&signer", "object"]);
    expect(result).toContain('object:{"inner":"0xabc"}');
  });

  it("uses ? for unknown types when paramTypes not provided", () => {
    const payload = {
      type: "entry_function_payload" as const,
      function: "0x1::some_module::func",
      type_arguments: [],
      arguments: ["hello"],
    };

    const result = generateCliCommand(payload);
    expect(result).toContain("'?:hello'");
  });

  it("handles multiple type arguments", () => {
    const payload = {
      type: "entry_function_payload" as const,
      function: "0x1::some_module::func",
      type_arguments: ["0x1::aptos_coin::AptosCoin", "0x2::token::Token"],
      arguments: [],
    };

    const result = generateCliCommand(payload);
    expect(result).toContain(
      "--type-args '0x1::aptos_coin::AptosCoin' '0x2::token::Token'",
    );
  });
});

describe("extractEntryFunctionPayload", () => {
  it("returns undefined for block_metadata_transaction", () => {
    const txn = {
      type: "block_metadata_transaction" as const,
      version: "1",
      hash: "0x123",
      state_change_hash: "",
      event_root_hash: "",
      state_checkpoint_hash: null,
      gas_used: "0",
      success: true,
      vm_status: "",
      accumulator_root_hash: "",
      changes: [],
      id: "",
      epoch: "1",
      round: "1",
      events: [],
      previous_block_votes_bitvec: [],
      proposer: "0x1",
      failed_proposer_indices: [],
      timestamp: "0",
    };

    expect(extractEntryFunctionPayload(txn)).toBeUndefined();
  });

  it("extracts payload from entry_function_payload", () => {
    const txn = {
      type: "user_transaction" as const,
      version: "1",
      hash: "0x123",
      state_change_hash: "",
      event_root_hash: "",
      state_checkpoint_hash: null,
      gas_used: "100",
      success: true,
      vm_status: "",
      accumulator_root_hash: "",
      changes: [],
      sender: "0x1",
      sequence_number: "0",
      max_gas_amount: "1000",
      gas_unit_price: "1",
      expiration_timestamp_secs: "999999999",
      payload: {
        type: "entry_function_payload" as const,
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: ["0xabc", "1000"],
      },
      events: [],
      timestamp: "0",
    };

    const result = extractEntryFunctionPayload(txn);
    expect(result).toBeDefined();
    expect(result?.function).toBe("0x1::coin::transfer");
    expect(result?.arguments).toEqual(["0xabc", "1000"]);
  });

  it("extracts payload from multisig_payload", () => {
    const txn = {
      type: "user_transaction" as const,
      version: "1",
      hash: "0x123",
      state_change_hash: "",
      event_root_hash: "",
      state_checkpoint_hash: null,
      gas_used: "100",
      success: true,
      vm_status: "",
      accumulator_root_hash: "",
      changes: [],
      sender: "0x1",
      sequence_number: "0",
      max_gas_amount: "1000",
      gas_unit_price: "1",
      expiration_timestamp_secs: "999999999",
      payload: {
        type: "multisig_payload" as const,
        multisig_address: "0xmulti",
        transaction_payload: {
          type: "entry_function_payload" as const,
          function: "0x1::coin::transfer",
          type_arguments: [],
          arguments: ["0xabc", "500"],
        },
      },
      events: [],
      timestamp: "0",
    };

    const result = extractEntryFunctionPayload(txn);
    expect(result).toBeDefined();
    expect(result?.function).toBe("0x1::coin::transfer");
    expect(result?.arguments).toEqual(["0xabc", "500"]);
  });

  it("returns undefined for script_payload", () => {
    const txn = {
      type: "user_transaction" as const,
      version: "1",
      hash: "0x123",
      state_change_hash: "",
      event_root_hash: "",
      state_checkpoint_hash: null,
      gas_used: "100",
      success: true,
      vm_status: "",
      accumulator_root_hash: "",
      changes: [],
      sender: "0x1",
      sequence_number: "0",
      max_gas_amount: "1000",
      gas_unit_price: "1",
      expiration_timestamp_secs: "999999999",
      payload: {
        type: "script_payload" as const,
        code: {bytecode: "0xabc"},
        type_arguments: [],
        arguments: [],
      },
      events: [],
      timestamp: "0",
    };

    expect(extractEntryFunctionPayload(txn)).toBeUndefined();
  });
});
