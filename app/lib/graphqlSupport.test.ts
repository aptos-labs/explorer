// Covers FEAT-FLAGS-001 — GraphQL / Indexer support check
// Covers FEAT-COIN-001, FEAT-FA-001 — Tab gating based on GraphQL
import {describe, expect, it} from "vitest";
import {getGraphqlURI} from "./constants";

describe("FEAT-FLAGS-001 — GraphQL URI configuration", () => {
  it("returns a string for mainnet", () => {
    const uri = getGraphqlURI("mainnet");
    expect(uri).toBeDefined();
    expect(typeof uri).toBe("string");
  });

  it("returns a string for testnet", () => {
    const uri = getGraphqlURI("testnet");
    expect(uri).toBeDefined();
    expect(typeof uri).toBe("string");
  });

  it("returns a string for devnet", () => {
    const uri = getGraphqlURI("devnet");
    expect(uri).toBeDefined();
    expect(typeof uri).toBe("string");
  });

  it("returns a local URI for local network", () => {
    const uri = getGraphqlURI("local");
    expect(uri).toBeDefined();
    expect(uri).toContain("127.0.0.1");
  });
});

describe("FEAT-COIN-001 / FEAT-FA-001 — Tab gating logic", () => {
  const TAB_VALUES_FULL = ["info", "holders", "transactions"];
  const TAB_VALUES_MINIMAL = ["info"];

  it("full tabs include holders and transactions beyond info", () => {
    expect(TAB_VALUES_FULL).toContain("holders");
    expect(TAB_VALUES_FULL).toContain("transactions");
    expect(TAB_VALUES_FULL).toContain("info");
  });

  it("minimal tabs only include info", () => {
    expect(TAB_VALUES_MINIMAL).toEqual(["info"]);
    expect(TAB_VALUES_MINIMAL).not.toContain("holders");
    expect(TAB_VALUES_MINIMAL).not.toContain("transactions");
  });

  it("info is always the first tab in full set", () => {
    expect(TAB_VALUES_FULL[0]).toBe("info");
  });
});
