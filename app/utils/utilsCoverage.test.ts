// Covers additional utils exports not yet in utils.test.ts
// FEAT-DATA-004 (identicon seed), FEAT-ROUTING-003 (entity helpers),
// FEAT-TXN-002 (transaction sorting), FEAT-WALLET-001 (wallet sorting)
import {describe, expect, it} from "vitest";
import {
  assertNever,
  extractFunctionParamNames,
  getBytecodeSizeInKB,
  getPublicFunctionLineNumber,
  isValidStruct,
  isValidUrl,
  sortPetraFirst,
  sortTransactions,
} from "./utils";

describe("FEAT-ROUTING-003 — isValidStruct", () => {
  it("accepts basic Move struct", () => {
    expect(isValidStruct("0x1::coin::CoinStore")).toBe(true);
  });

  it("accepts struct with generic param", () => {
    expect(
      isValidStruct("0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"),
    ).toBe(true);
  });

  it("rejects plain address", () => {
    expect(isValidStruct("0x1")).toBe(false);
  });

  it("rejects non-hex prefix", () => {
    expect(isValidStruct("abc::module::Type")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidStruct("")).toBe(false);
  });
});

describe("FEAT-TXN-002 — sortTransactions (comparator)", () => {
  const makeTxn = (version: string) =>
    ({type: "user_transaction", version}) as Parameters<
      typeof sortTransactions
    >[0];

  it("sorts higher version before lower", () => {
    expect(sortTransactions(makeTxn("3"), makeTxn("1"))).toBe(-1);
  });

  it("sorts lower version after higher", () => {
    expect(sortTransactions(makeTxn("1"), makeTxn("3"))).toBe(1);
  });

  it("works when used with Array.sort for descending order", () => {
    const txns = [makeTxn("1"), makeTxn("3"), makeTxn("2")];
    const sorted = [...txns].sort(sortTransactions);
    expect(sorted.map((t) => ("version" in t ? t.version : ""))).toEqual([
      "3",
      "2",
      "1",
    ]);
  });
});

describe("FEAT-WALLET-001 — sortPetraFirst (comparator)", () => {
  it("returns -1 for Petra", () => {
    const wallet = {name: "Petra"} as Parameters<typeof sortPetraFirst>[0];
    expect(sortPetraFirst(wallet)).toBe(-1);
  });

  it("returns 1 for non-Petra", () => {
    const wallet = {name: "Nightly"} as Parameters<typeof sortPetraFirst>[0];
    expect(sortPetraFirst(wallet)).toBe(1);
  });

  it("Petra sorts first when used with Array.sort", () => {
    const wallets = [
      {name: "Nightly"},
      {name: "Petra"},
      {name: "Martian"},
    ] as Array<Parameters<typeof sortPetraFirst>[0]>;
    const sorted = [...wallets].sort(sortPetraFirst);
    expect(sorted[0].name).toBe("Petra");
  });
});

describe("assertNever", () => {
  it("throws when called", () => {
    expect(() => assertNever("unexpected" as never)).toThrow();
  });
});

describe("isValidUrl", () => {
  it("accepts https URL", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("accepts http URL", () => {
    expect(isValidUrl("http://localhost:3000")).toBe(true);
  });

  it("rejects plain text", () => {
    expect(isValidUrl("not a url")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });
});

describe("FEAT-MODULES-004 — getBytecodeSizeInKB", () => {
  it("returns a number for hex bytecode", () => {
    const hex = "0x" + "ab".repeat(512);
    const result = getBytecodeSizeInKB(hex);
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThan(0);
  });

  it("computes correct KB for known size", () => {
    const hex = "0x" + "ab".repeat(1024);
    const result = getBytecodeSizeInKB(hex);
    expect(result).toBe(1);
  });
});

describe("FEAT-MODULES-001 — extractFunctionParamNames", () => {
  it("extracts parameter names from Move source", () => {
    const source =
      "public fun transfer(from: &signer, to: address, amount: u64) {";
    const names = extractFunctionParamNames(source, "transfer");
    expect(names).toContain("from");
    expect(names).toContain("to");
    expect(names).toContain("amount");
  });

  it("returns null for missing function", () => {
    const names = extractFunctionParamNames("fun other() {}", "transfer");
    expect(names).toBeNull();
  });

  it("returns null for empty source", () => {
    expect(extractFunctionParamNames("", "transfer")).toBeNull();
  });

  it("returns null for empty function name", () => {
    expect(extractFunctionParamNames("source", "")).toBeNull();
  });
});

describe("FEAT-MODULES-001 — getPublicFunctionLineNumber", () => {
  it("finds line number of a public function", () => {
    const source = "module 0x1::coin {\n  public fun transfer() {}\n}";
    const line = getPublicFunctionLineNumber(source, "transfer");
    expect(typeof line).toBe("number");
    expect(line).toBeGreaterThan(0);
  });

  it("returns 0 for non-existent function", () => {
    const line = getPublicFunctionLineNumber("module {}", "missing");
    expect(line).toBe(0);
  });

  it("returns 0 for empty function name", () => {
    expect(getPublicFunctionLineNumber("source", "")).toBe(0);
  });
});
