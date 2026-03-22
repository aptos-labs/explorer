import {describe, expect, it} from "vitest";
import {
  bytecodeHexToBytes,
  getDecompiledCodeView,
  getDecompiledScriptCodeView,
  normalizeBytecodeHex,
} from "./moveDecompiler";

describe("normalizeBytecodeHex", () => {
  it("adds 0x prefix and lowercases when missing", () => {
    expect(normalizeBytecodeHex("00FF")).toBe("0x00ff");
  });

  it("lowercases when 0x prefix is present", () => {
    expect(normalizeBytecodeHex("0xAbCd")).toBe("0xabcd");
  });
});

describe("bytecodeHexToBytes", () => {
  it("converts prefixed hex bytecode to bytes", () => {
    const bytes = bytecodeHexToBytes("0xA0B1C2");

    expect(Array.from(bytes)).toEqual([160, 177, 194]);
  });

  it("converts non-prefixed hex bytecode to bytes", () => {
    const bytes = bytecodeHexToBytes("00ff10");

    expect(Array.from(bytes)).toEqual([0, 255, 16]);
  });

  it("throws for empty bytecode", () => {
    expect(() => bytecodeHexToBytes("")).toThrow("Bytecode is empty");
  });

  it("throws for malformed bytecode", () => {
    expect(() => bytecodeHexToBytes("0xz")).toThrow("Invalid bytecode hex");
    expect(() => bytecodeHexToBytes("abc")).toThrow("Invalid bytecode hex");
  });
});

describe("getDecompiledCodeView", () => {
  it("throws in non-browser environments", async () => {
    await expect(
      getDecompiledCodeView("0x00", "decompiled-source"),
    ).rejects.toThrow("Move decompiler is only available in the browser");
  });
});

describe("getDecompiledScriptCodeView", () => {
  it("throws in non-browser environments", async () => {
    await expect(
      getDecompiledScriptCodeView("0x00", "decompiled-source"),
    ).rejects.toThrow("Move decompiler is only available in the browser");
  });
});
