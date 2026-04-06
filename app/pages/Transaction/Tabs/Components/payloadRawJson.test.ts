import {describe, expect, it} from "vitest";
import {payloadForRawJsonView} from "./payloadRawJson";

describe("payloadForRawJsonView", () => {
  it("replaces script bytecode with a pointer string", () => {
    const payload = {
      type: "script_payload" as const,
      code: {bytecode: "0xdeadbeef"},
      type_arguments: [] as string[],
      arguments: [] as unknown[],
    };
    const view = payloadForRawJsonView(payload) as {
      code: {bytecode: string};
    };
    expect(view.code.bytecode).toContain("omitted");
    expect(view.code.bytecode).not.toContain("deadbeef");
  });

  it("passes through entry_function_payload unchanged", () => {
    const payload = {
      type: "entry_function_payload" as const,
      function: "0x1::coin::transfer",
      type_arguments: [],
      arguments: [],
    };
    expect(payloadForRawJsonView(payload)).toEqual(payload);
  });

  it("replaces nested multisig script bytecode with a pointer string", () => {
    const payload = {
      type: "multisig_payload" as const,
      multisig_address: "0x123",
      transaction_payload: {
        type: "script_payload" as const,
        code: {bytecode: "0xdeadbeef"},
        type_arguments: [] as string[],
        arguments: [] as unknown[],
      },
    };
    const view = payloadForRawJsonView(payload) as {
      transaction_payload: {
        code: {bytecode: string};
      };
    };
    expect(view.transaction_payload.code.bytecode).toContain("omitted");
    expect(view.transaction_payload.code.bytecode).not.toContain("deadbeef");
  });
});
