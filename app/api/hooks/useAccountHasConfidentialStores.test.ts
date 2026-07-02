import {describe, expect, it} from "vitest";
import {confidentialStoreStaleTime} from "./useAccountHasConfidentialStores";

const ADDR_A =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const ADDR_B =
  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const FA_X = "0x1::aptos_coin::AptosCoin";
const FA_Y = "0x1::other_coin::OtherCoin";

const DAY_MS = 24 * 60 * 60 * 1000;
const JITTER_MS = 6 * 60 * 60 * 1000;

describe("confidentialStoreStaleTime", () => {
  it("is deterministic for the same (user, fa, network)", () => {
    const a = confidentialStoreStaleTime(ADDR_A, FA_X, "mainnet");
    const b = confidentialStoreStaleTime(ADDR_A, FA_X, "mainnet");
    expect(a).toBe(b);
  });

  it("stays within ±jitter of the 24h base", () => {
    const t = confidentialStoreStaleTime(ADDR_A, FA_X, "mainnet");
    expect(t).toBeGreaterThanOrEqual(DAY_MS - JITTER_MS);
    expect(t).toBeLessThanOrEqual(DAY_MS + JITTER_MS);
  });

  it("returns different values for different inputs (so users do not refresh in lockstep)", () => {
    const seen = new Set<number>();
    seen.add(confidentialStoreStaleTime(ADDR_A, FA_X, "mainnet"));
    seen.add(confidentialStoreStaleTime(ADDR_B, FA_X, "mainnet"));
    seen.add(confidentialStoreStaleTime(ADDR_A, FA_Y, "mainnet"));
    seen.add(confidentialStoreStaleTime(ADDR_A, FA_X, "testnet"));
    // All four inputs should produce distinct values; at minimum, more than 1.
    expect(seen.size).toBeGreaterThan(1);
  });

  it("is finite for empty strings", () => {
    const t = confidentialStoreStaleTime("", "", "");
    expect(Number.isFinite(t)).toBe(true);
    expect(t).toBeGreaterThanOrEqual(DAY_MS - JITTER_MS);
    expect(t).toBeLessThanOrEqual(DAY_MS + JITTER_MS);
  });
});
