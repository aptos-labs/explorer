// Covers FEAT-CHROME-005 — Localnet detection constants
import {describe, expect, it} from "vitest";
import {networks} from "../lib/constants";

describe("FEAT-CHROME-005 — Localnet detection", () => {
  it("local network points to localhost", () => {
    expect(networks.local).toContain("127.0.0.1");
  });

  it("local network URL has port 8080", () => {
    expect(networks.local).toContain("8080");
  });

  it("local network URL ends with /v1", () => {
    expect(networks.local).toMatch(/\/v1$/);
  });

  it("local network is a valid URL", () => {
    expect(() => new URL(networks.local)).not.toThrow();
  });
});
