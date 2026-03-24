// Covers FEAT-VALIDATORS-001 — Validator tab values and enum
import {describe, expect, it} from "vitest";
import {VALIDATORS_TAB_VALUE} from "./Tabs";

describe("FEAT-VALIDATORS-001 — VALIDATORS_TAB_VALUE", () => {
  it("ALL_NODES is 'all'", () => {
    expect(VALIDATORS_TAB_VALUE.ALL_NODES).toBe("all");
  });

  it("DELEGATION_NODES is 'delegation'", () => {
    expect(VALIDATORS_TAB_VALUE.DELEGATION_NODES).toBe("delegation");
  });

  it("ENHANCED_DELEGATION_NODES is 'enhanced_delegation'", () => {
    expect(VALIDATORS_TAB_VALUE.ENHANCED_DELEGATION_NODES).toBe(
      "enhanced_delegation",
    );
  });

  it("has exactly 3 values", () => {
    const values = Object.values(VALIDATORS_TAB_VALUE);
    expect(values).toHaveLength(3);
  });

  it("all values are unique", () => {
    const values = Object.values(VALIDATORS_TAB_VALUE);
    expect(new Set(values).size).toBe(values.length);
  });
});
