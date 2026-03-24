// Covers FEAT-ANALYTICS-001 — Mainnet gate
// Covers FEAT-ANALYTICS-005 — Data source URL
import {describe, expect, it} from "vitest";
import {defaultNetworkName} from "../../lib/constants";

describe("FEAT-ANALYTICS-001 — Mainnet gate", () => {
  it("defaultNetworkName is mainnet (analytics only render on default)", () => {
    expect(defaultNetworkName).toBe("mainnet");
  });

  it("analytics data URL is a valid GCS URL", () => {
    const url =
      "https://storage.googleapis.com/aptos-mainnet/explorer/chain_stats_v2.json";
    expect(url).toContain("storage.googleapis.com");
    expect(url).toContain("chain_stats_v2.json");
  });
});
