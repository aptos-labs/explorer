import {describe, expect, it} from "vitest";
import {MOVE_2_MIN_BYTECODE_VERSION} from "./bytecodeVerification";

describe("MOVE_2_MIN_BYTECODE_VERSION", () => {
  it("is set to version 6", () => {
    expect(MOVE_2_MIN_BYTECODE_VERSION).toBe(6);
  });
});

describe("verifyModuleBytecode", () => {
  it("returns an error when WASM is unavailable (non-browser)", async () => {
    const {verifyModuleBytecode} = await import("./bytecodeVerification");
    const result = await verifyModuleBytecode({
      moduleBytecodeHex: "0x00",
      publishedSourceHex: "0x1f8b0800000000000000",
    });
    expect(result.status).toBe("error");
    expect(result.error).toBeDefined();
  });
});
