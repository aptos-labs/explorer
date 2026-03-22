import {describe, expect, it} from "vitest";
import {getFieldCopyValue, isStructResult} from "./contractResultUtils";

describe("getFieldCopyValue", () => {
  it("returns raw string without JSON escaping for string values", () => {
    expect(getFieldCopyValue('ICHI vault #"USDC"-"APT"')).toBe(
      'ICHI vault #"USDC"-"APT"',
    );
  });

  it("returns plain string for simple strings", () => {
    expect(getFieldCopyValue("hello world")).toBe("hello world");
  });

  it("returns string representation for numbers", () => {
    expect(getFieldCopyValue(42)).toBe("42");
    expect(getFieldCopyValue(0)).toBe("0");
  });

  it("returns string representation for booleans", () => {
    expect(getFieldCopyValue(true)).toBe("true");
    expect(getFieldCopyValue(false)).toBe("false");
  });

  it("returns JSON for objects", () => {
    const obj = {collection: "ICHI_Vault_LP", creator: "0xaae"};
    expect(getFieldCopyValue(obj)).toBe(JSON.stringify(obj, null, 2));
  });

  it("returns JSON for arrays", () => {
    const arr = ["a", "b", "c"];
    expect(getFieldCopyValue(arr)).toBe(JSON.stringify(arr, null, 2));
  });

  it("returns empty string for null", () => {
    expect(getFieldCopyValue(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(getFieldCopyValue(undefined)).toBe("");
  });

  it("returns string representation for bigint", () => {
    expect(getFieldCopyValue(BigInt(123))).toBe("123");
  });

  it("preserves quotes inside strings without adding backslashes", () => {
    const value =
      'ICHI vault #"USDC"-"APT"-"X20"-"@0x6e24baa92d82586c89dbd02bf6aeb0939fa98ea112254e76223226f2d176c5d1"';
    const result = getFieldCopyValue(value);
    expect(result).not.toContain("\\");
    expect(result).toContain('"USDC"');
    expect(result).toContain('"APT"');
  });

  it("handles non-serialisable values gracefully", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const result = getFieldCopyValue(circular);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("isStructResult", () => {
  it("returns true for plain objects", () => {
    expect(
      isStructResult({collection: "test", creator: "0x1", name: "foo"}),
    ).toBe(true);
  });

  it("returns true for empty objects", () => {
    expect(isStructResult({})).toBe(true);
  });

  it("returns false for arrays", () => {
    expect(isStructResult(["a", "b"])).toBe(false);
    expect(isStructResult([])).toBe(false);
  });

  it("returns false for strings", () => {
    expect(isStructResult("hello")).toBe(false);
  });

  it("returns false for numbers", () => {
    expect(isStructResult(42)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isStructResult(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isStructResult(undefined)).toBe(false);
  });

  it("returns false for booleans", () => {
    expect(isStructResult(true)).toBe(false);
    expect(isStructResult(false)).toBe(false);
  });
});

describe("struct response field unescaping scenario", () => {
  it("correctly handles the vault token data example from the issue", () => {
    const apiResponse = {
      collection: "ICHI_Vault_LP",
      creator:
        "0xaaead394fd54c88538ec2372bdb8023a347b80338d40559b0f2732113dda87ab",
      name: 'ICHI vault #"USDC"-"APT"-"X20"-"@0x6e24baa92d82586c89dbd02bf6aeb0939fa98ea112254e76223226f2d176c5d1"',
    };

    expect(isStructResult(apiResponse)).toBe(true);

    expect(getFieldCopyValue(apiResponse.name)).toBe(
      'ICHI vault #"USDC"-"APT"-"X20"-"@0x6e24baa92d82586c89dbd02bf6aeb0939fa98ea112254e76223226f2d176c5d1"',
    );
    expect(getFieldCopyValue(apiResponse.name)).not.toContain("\\");

    expect(getFieldCopyValue(apiResponse.collection)).toBe("ICHI_Vault_LP");

    expect(getFieldCopyValue(apiResponse.creator)).toBe(
      "0xaaead394fd54c88538ec2372bdb8023a347b80338d40559b0f2732113dda87ab",
    );
  });

  it("demonstrates the difference between JSON.stringify and getFieldCopyValue", () => {
    const nameWithQuotes = 'hello "world"';

    const jsonVersion = JSON.stringify(nameWithQuotes);
    expect(jsonVersion).toBe('"hello \\"world\\""');
    expect(jsonVersion).toContain("\\");

    const copyVersion = getFieldCopyValue(nameWithQuotes);
    expect(copyVersion).toBe('hello "world"');
    expect(copyVersion).not.toContain("\\");
  });

  it("handles mixed result types from view function responses", () => {
    const results: unknown[] = [
      "simple_string",
      {
        collection: "test",
        name: 'value with "quotes"',
      },
      42,
    ];

    expect(isStructResult(results[0])).toBe(false);
    expect(isStructResult(results[1])).toBe(true);
    expect(isStructResult(results[2])).toBe(false);

    const structResult = results[1] as Record<string, unknown>;
    expect(getFieldCopyValue(structResult.name)).toBe('value with "quotes"');
  });
});
