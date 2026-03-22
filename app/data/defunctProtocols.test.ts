import {describe, expect, it} from "vitest";
import {MIN_OWNER_WITHDRAWAL_PERCENT} from "../types/defunctProtocol";
import {
  defunctProtocols,
  getDefunctProtocol,
  getWithdrawalPlugin,
  withdrawalPlugins,
} from "./defunctProtocols";

describe("defunctProtocols registry", () => {
  it("should have at least one defunct protocol", () => {
    expect(defunctProtocols.length).toBeGreaterThan(0);
  });

  it("every protocol should have required fields", () => {
    for (const p of defunctProtocols) {
      expect(p.address).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.status).toBeTruthy();
      expect(p.description).toBeTruthy();
    }
  });

  it("should have unique addresses", () => {
    const addresses = defunctProtocols.map((p) => p.address.toLowerCase());
    expect(new Set(addresses).size).toBe(addresses.length);
  });

  it("every withdrawal plugin should satisfy the 90% owner requirement", () => {
    for (const [addr, plugin] of withdrawalPlugins) {
      expect(plugin.ownerPercentage).toBeGreaterThanOrEqual(
        MIN_OWNER_WITHDRAWAL_PERCENT,
      );
      expect(plugin.protocolAddress.toLowerCase()).toBe(addr);
    }
  });

  it("withdrawal plugin keys should be lowercased", () => {
    for (const [key] of withdrawalPlugins) {
      expect(key).toBe(key.toLowerCase());
    }
  });
});

describe("getDefunctProtocol", () => {
  it("should find SushiSwap by address", () => {
    const result = getDefunctProtocol(
      "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c",
    );
    expect(result).toBeDefined();
    expect(result?.name).toBe("SushiSwap");
  });

  it("should be case-insensitive", () => {
    const result = getDefunctProtocol(
      "0x31A6675CBE84365BF2B0CBCE617ECE6C47023EF70826533BDE5203D32171DC3C",
    );
    expect(result).toBeDefined();
    expect(result?.name).toBe("SushiSwap");
  });

  it("should return undefined for unknown address", () => {
    expect(getDefunctProtocol("0xdeadbeef")).toBeUndefined();
  });
});

describe("getWithdrawalPlugin", () => {
  it("should return undefined for protocols without plugins", () => {
    expect(
      getWithdrawalPlugin(
        "0x31a6675cbe84365bf2b0cbce617ece6c47023ef70826533bde5203d32171dc3c",
      ),
    ).toBeUndefined();
  });
});
