// Covers FEAT-TELEMETRY-001 — GTM event names
import {describe, expect, it} from "vitest";
import {GTMEvents} from "../../dataConstants";

describe("FEAT-TELEMETRY-001 — GTM event constants", () => {
  it("WALLET_CONNECTION event name is walletConnection", () => {
    expect(GTMEvents.WALLET_CONNECTION).toBe("walletConnection");
  });

  it("SEARCH_STATS event name is searchStats", () => {
    expect(GTMEvents.SEARCH_STATS).toBe("searchStats");
  });
});
