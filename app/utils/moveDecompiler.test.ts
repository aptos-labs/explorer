import {describe, expect, it} from "vitest";
import {bytecodeHexToBytes} from "./moveDecompiler";

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
