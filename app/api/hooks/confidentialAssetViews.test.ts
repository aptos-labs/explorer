import {describe, expect, it} from "vitest";
import {
  parseConfidentialStoreBool,
  parseConfidentialSupplyU64,
} from "./confidentialAssetViews";

// Covers FEAT-FA-002 / FEAT-COIN-002 / FEAT-ACCOUNT-007 — confidential-asset view parsing
describe("confidential asset view parsing", () => {
  it("parses has_confidential_store boolean", () => {
    expect(parseConfidentialStoreBool([true])).toBe(true);
    expect(parseConfidentialStoreBool(["true"])).toBe(true);
    expect(parseConfidentialStoreBool([false])).toBe(false);
    expect(parseConfidentialStoreBool([])).toBe(false);
  });

  it("parses get_total_confidential_supply u64 string", () => {
    expect(parseConfidentialSupplyU64(["1234567890"])).toBe(1234567890n);
    expect(parseConfidentialSupplyU64(["0"])).toBe(0n);
    expect(parseConfidentialSupplyU64([])).toBe(null);
  });
});
