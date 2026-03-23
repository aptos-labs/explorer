import {describe, expect, it} from "vitest";
import {MOVE_2_MIN_BYTECODE_VERSION} from "./bytecodeVerification";

describe("MOVE_2_MIN_BYTECODE_VERSION", () => {
  it("is set to version 6", () => {
    expect(MOVE_2_MIN_BYTECODE_VERSION).toBe(6);
  });
});

describe("verifyModuleBytecode", () => {
  it("returns an error-like result in non-browser environments", async () => {
    const {verifyModuleBytecode} = await import("./bytecodeVerification");
    const result = await verifyModuleBytecode({
      moduleBytecodeHex: "0x00",
    });
    // In non-browser (no `window`), WASM loader throws; verification
    // still returns a result with bytecode integrity failed.
    expect(["error", "unverified", "partial"]).toContain(result.status);
    expect(result.checks.length).toBeGreaterThanOrEqual(1);
  });
});
