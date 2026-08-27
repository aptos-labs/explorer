// Covers FEAT-VALIDATORS-001 — Validator tab values and enum
import {describe, expect, it} from "vitest";
import {VALIDATORS_TAB_VALUE} from "./Tabs";
import {validatorsTabHeadTitle} from "./validatorsTabMeta";

describe("FEAT-VALIDATORS-001 — VALIDATORS_TAB_VALUE", () => {
  it("ALL_NODES is 'all'", () => {
    expect(VALIDATORS_TAB_VALUE.ALL_NODES).toBe("all");
  });

  it("DELEGATION_NODES is 'delegation'", () => {
    expect(VALIDATORS_TAB_VALUE.DELEGATION_NODES).toBe("delegation");
  });

  it("has exactly 2 values", () => {
    const values = Object.values(VALIDATORS_TAB_VALUE);
    expect(values).toHaveLength(2);
  });

  it("all values are unique", () => {
    const values = Object.values(VALIDATORS_TAB_VALUE);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe("FEAT-VALIDATORS-001 — validatorsTabHeadTitle", () => {
  it("titles canonical tabs", () => {
    expect(validatorsTabHeadTitle(undefined)).toBe("All Nodes");
    expect(validatorsTabHeadTitle("all")).toBe("All Nodes");
    expect(validatorsTabHeadTitle("delegation")).toBe("Delegation Nodes");
  });

  it("titles the retired enhanced_delegation path as Delegation Nodes", () => {
    expect(validatorsTabHeadTitle("enhanced_delegation")).toBe(
      "Delegation Nodes",
    );
  });
});
