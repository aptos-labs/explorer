// Covers FEAT-ACCOUNT-008 — Scam collection detection
import {describe, expect, it} from "vitest";
import {getNetworkData} from "./index";

describe("FEAT-ACCOUNT-008 — Banned collections", () => {
  it("mainnet has banned collections", () => {
    const data = getNetworkData("mainnet");
    const banned = data.bannedCollections;
    expect(typeof banned).toBe("object");
    expect(Object.keys(banned).length).toBeGreaterThan(0);
  });

  it("banned collection keys are hex addresses", () => {
    const data = getNetworkData("mainnet");
    for (const key of Object.keys(data.bannedCollections)) {
      expect(key).toMatch(/^0x[a-fA-F0-9]+$/);
    }
  });

  it("banned collection values are non-empty reason strings", () => {
    const data = getNetworkData("mainnet");
    for (const reason of Object.values(data.bannedCollections)) {
      expect(typeof reason).toBe("string");
      expect(reason.length).toBeGreaterThan(0);
    }
  });

  it("testnet has banned collections record (may be empty)", () => {
    const data = getNetworkData("testnet");
    expect(typeof data.bannedCollections).toBe("object");
  });
});
