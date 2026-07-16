import {
  AccountAddress,
  Bool,
  MoveString,
  MoveVector,
  U8,
  type U64,
} from "@aptos-labs/ts-sdk";
import {describe, expect, it} from "vitest";
import {
  convertScriptFunctionArgument,
  convertScriptFunctionArguments,
  normalizeScriptBytecode,
  resolveScriptArgType,
} from "./scriptArguments";

// Covers FEAT-SCRIPT-001 (raw Move script argument encoding + bytecode validation)
describe("FEAT-SCRIPT-001 — script argument conversion", () => {
  it("converts primitive scalar types to typed BCS values", () => {
    expect(convertScriptFunctionArgument("bool", "true")).toBeInstanceOf(Bool);
    expect((convertScriptFunctionArgument("bool", "false") as Bool).value).toBe(
      false,
    );
    expect(convertScriptFunctionArgument("u8", "255")).toBeInstanceOf(U8);
    expect((convertScriptFunctionArgument("u64", "123") as U64).value).toBe(
      123n,
    );
  });

  it("converts addresses", () => {
    const arg = convertScriptFunctionArgument("address", "0x1");
    expect(arg).toBeInstanceOf(AccountAddress);
    expect((arg as AccountAddress).toString()).toBe("0x1");
  });

  it("converts 0x1::string::String", () => {
    const arg = convertScriptFunctionArgument("0x1::string::String", "hello");
    expect(arg).toBeInstanceOf(MoveString);
    expect((arg as MoveString).value).toBe("hello");
  });

  it("converts vector<u8> from a hex string", () => {
    const arg = convertScriptFunctionArgument(
      "vector<u8>",
      "0xdeadbeef",
    ) as MoveVector<U8>;
    expect(arg).toBeInstanceOf(MoveVector);
    expect(arg.values.map((v) => v.value)).toEqual([222, 173, 190, 239]);
  });

  it("converts vector<u8> from a JSON byte array", () => {
    const arg = convertScriptFunctionArgument(
      "vector<u8>",
      "[1, 2, 3]",
    ) as MoveVector<U8>;
    expect(arg.values.map((v) => v.value)).toEqual([1, 2, 3]);
  });

  it("converts vector<address> from JSON and CSV forms", () => {
    const fromJson = convertScriptFunctionArgument(
      "vector<address>",
      '["0x1", "0x2"]',
    ) as MoveVector<AccountAddress>;
    expect(fromJson.values.map((a) => a.toString())).toEqual(["0x1", "0x2"]);

    const fromCsv = convertScriptFunctionArgument(
      "vector<address>",
      "0x1, 0x2",
    ) as MoveVector<AccountAddress>;
    expect(fromCsv.values.map((a) => a.toString())).toEqual(["0x1", "0x2"]);
  });

  it("throws a descriptive error for invalid bool values", () => {
    expect(() => convertScriptFunctionArgument("bool", "yes")).toThrow(
      /Invalid bool/,
    );
  });

  it("throws for unparseable type tags", () => {
    expect(() => convertScriptFunctionArgument("not_a_type", "1")).toThrow(
      /Could not parse type/,
    );
  });

  it("prefixes errors with the 1-based argument index", () => {
    expect(() =>
      convertScriptFunctionArguments([
        {type: "u8", value: "1"},
        {type: "bool", value: "oops"},
      ]),
    ).toThrow(/Argument #2/);
  });

  it("resolves the custom type escape hatch", () => {
    expect(
      resolveScriptArgType({
        type: "custom",
        customType: "vector<u64>",
        value: "",
      }),
    ).toBe("vector<u64>");
    expect(resolveScriptArgType({type: "address", value: ""})).toBe("address");
  });
});

// Covers FEAT-SCRIPT-001 (bytecode normalization)
describe("FEAT-SCRIPT-001 — bytecode normalization", () => {
  it("adds a 0x prefix when missing", () => {
    expect(normalizeScriptBytecode("a11ceb0b")).toBe("0xa11ceb0b");
  });

  it("preserves an existing 0x prefix and trims whitespace", () => {
    expect(normalizeScriptBytecode("  0xA11CEB0B  ")).toBe("0xA11CEB0B");
  });

  it("rejects empty input", () => {
    expect(() => normalizeScriptBytecode("   ")).toThrow(/required/);
  });

  it("rejects non-hex input", () => {
    expect(() => normalizeScriptBytecode("0xnothex")).toThrow(/hex string/);
  });

  it("rejects odd-length hex", () => {
    expect(() => normalizeScriptBytecode("0xabc")).toThrow(/even number/);
  });
});
