// Covers FEAT-NETWORK-001 — Network configuration and hidden networks
// Covers FEAT-FLAGS-002 — Mainnet-only features gating
import {describe, expect, it} from "vitest";
import {
  defaultNetworkName,
  features,
  hiddenNetworks,
  networks,
} from "./constants";

describe("FEAT-NETWORK-001 — Network configuration", () => {
  it("includes all expected visible networks", () => {
    expect(networks).toHaveProperty("mainnet");
    expect(networks).toHaveProperty("testnet");
    expect(networks).toHaveProperty("devnet");
  });

  it("includes localnet as 'local'", () => {
    expect(networks).toHaveProperty("local");
    expect(networks.local).toContain("127.0.0.1");
  });

  it("includes hidden networks in the networks map", () => {
    for (const hidden of hiddenNetworks) {
      expect(networks).toHaveProperty(hidden);
    }
  });

  it("hiddenNetworks contains decibel and shelbynet", () => {
    expect(hiddenNetworks).toContain("decibel");
    expect(hiddenNetworks).toContain("shelbynet");
  });

  it("default network is mainnet", () => {
    expect(defaultNetworkName).toBe("mainnet");
  });

  it("all network values are valid URLs", () => {
    for (const [_name, url] of Object.entries(networks)) {
      expect(url).toMatch(/^https?:\/\//);
    }
  });
});

describe("FEAT-FLAGS-003 — Feature name configuration", () => {
  it("features map includes dev and earlydev", () => {
    expect(features).toHaveProperty("dev");
    expect(features).toHaveProperty("earlydev");
  });

  it("dev feature label is Development Mode", () => {
    expect(features.dev).toBe("Development Mode");
  });

  it("earlydev feature label is Early Development Mode", () => {
    expect(features.earlydev).toBe("Early Development Mode");
  });
});
