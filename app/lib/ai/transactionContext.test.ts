import {describe, expect, it} from "vitest";
import type {Types} from "~/types/aptos";
import {
  buildTransactionDescriptionPrompt,
  extractTransactionAiInputs,
  extractTransactionAiOutputs,
  parseMoveFunctionId,
  scriptBytecodeFromTransaction,
  summarizeWriteSetChange,
  truncateText,
} from "./transactionContext";

const userTxn = {
  type: "user_transaction",
  version: "99",
  hash: "0xabc",
  sender: "0x1",
  success: true,
  vm_status: "Executed successfully",
  gas_used: "12",
  payload: {
    type: "entry_function_payload",
    function: "0x1::coin::transfer",
    type_arguments: ["0x1::aptos_coin::AptosCoin"],
    arguments: ["0x2", "1000"],
  },
  events: [
    {
      guid: {creation_number: "0", account_address: "0x1"},
      sequence_number: "0",
      type: "0x1::coin::WithdrawEvent",
      data: {amount: "1000"},
    },
  ],
  changes: [
    {
      type: "write_resource",
      address: "0x1",
      state_key_hash: "0x",
      data: {type: "0x1::coin::CoinStore", data: {}},
    },
    {
      type: "write_module",
      address: "0x1",
      state_key_hash: "0x",
      data: {
        bytecode: "0xdeadbeef",
        abi: {
          address: "0x1",
          name: "coin",
          friends: [],
          exposed_functions: [],
          structs: [],
        },
      },
    },
  ],
} as unknown as Types.Transaction;

describe("transaction AI context", () => {
  it("parses Move function ids", () => {
    expect(parseMoveFunctionId("0x1::coin::transfer")).toEqual({
      address:
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      moduleName: "coin",
      functionName: "transfer",
    });
    expect(parseMoveFunctionId("0x1::coin")).toBeUndefined();
  });

  it("extracts entry-function inputs and summarized outputs", () => {
    // Covers FEAT-TXN-016
    const inputs = extractTransactionAiInputs(userTxn);
    expect(inputs.entryFunction).toBe("0x1::coin::transfer");
    expect(inputs.arguments).toEqual(["0x2", "1000"]);
    expect(inputs.scriptBytecodePresent).toBe(false);

    const outputs = extractTransactionAiOutputs(userTxn);
    expect(outputs.success).toBe(true);
    expect(outputs.events[0]).toEqual({
      type: "0x1::coin::WithdrawEvent",
      data: {amount: "1000"},
    });
    expect(outputs.changes).toEqual([
      {
        type: "write_resource",
        address: "0x1",
        resource: "0x1::coin::CoinStore",
      },
      {type: "write_module", address: "0x1", module: "coin"},
    ]);
  });

  it("does not include module bytecode in write-set summaries", () => {
    const summary = summarizeWriteSetChange({
      type: "write_module",
      address: "0x1",
      state_key_hash: "0x",
      data: {
        bytecode: "0xsecretbytecode",
        abi: {
          address: "0x1",
          name: "m",
          friends: [],
          exposed_functions: [],
          structs: [],
        },
      },
    });
    expect(JSON.stringify(summary)).not.toContain("secretbytecode");
  });

  it("pulls script bytecode and inner decrypted scripts", () => {
    const scriptTxn = {
      type: "user_transaction",
      payload: {
        type: "script_payload",
        code: {bytecode: "0xa11ce"},
        type_arguments: [],
        arguments: [],
      },
    } as unknown as Types.Transaction;
    expect(scriptBytecodeFromTransaction(scriptTxn)).toBe("0xa11ce");
  });

  it("builds a prompt that includes source, inputs, and outputs", () => {
    const prompt = buildTransactionDescriptionPrompt({
      inputs: extractTransactionAiInputs(userTxn),
      outputs: extractTransactionAiOutputs(userTxn),
      sources: [
        {
          kind: "module",
          identifier: "0x1::coin",
          origin: "published",
          code: "module coin { public entry fun transfer() {} }",
        },
      ],
    });
    expect(prompt.user).toContain("0x1::coin::transfer");
    expect(prompt.user).toContain("module coin");
    expect(prompt.user).toContain("WithdrawEvent");
    expect(prompt.system).toContain("Aptos Explorer");
  });

  it("truncates oversized text", () => {
    expect(truncateText("abcdef", 4)).toContain("truncated");
    expect(truncateText("abcd", 4)).toBe("abcd");
  });
});
