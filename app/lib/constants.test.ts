// Covers FEAT-RATE-LIMIT (client API key fallback behavior).
// These tests pin the contract that:
//   1. `getApiKey` returns a non-undefined value for every non-`local`
//      network even when no `VITE_APTOS_<NETWORK>_API_KEY` env var is set
//      (so the client bundle always carries an API key for rate-limit
//      bucketing).
//   2. An explicit override always wins.
//   3. `warnIfClientMissingApiKey` emits a one-time `console.error` when
//      the client has no API key for a network that normally has one.
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {
  getApiKey,
  resetMissingApiKeyWarnings,
  warnIfClientMissingApiKey,
} from "./constants";

describe("client API key fallbacks", () => {
  it("returns a non-empty default key for mainnet when no env var or override is set", () => {
    const key = getApiKey("mainnet");
    expect(key).toBeTruthy();
    expect(typeof key).toBe("string");
    // Aptos Gateway client IDs are prefixed with "AG-".
    expect(key).toMatch(/^AG-/);
  });

  it("returns a non-empty default key for testnet", () => {
    const key = getApiKey("testnet");
    expect(key).toBeTruthy();
    expect(key).toMatch(/^AG-/);
  });

  it("returns a non-empty default key for devnet", () => {
    const key = getApiKey("devnet");
    expect(key).toBeTruthy();
    expect(key).toMatch(/^AG-/);
  });

  it("returns undefined for local (no public API key expected)", () => {
    const key = getApiKey("local");
    expect(key).toBeUndefined();
  });

  it("prefers an explicit override over the default", () => {
    const override = "AG-USER-OVERRIDE-KEY";
    expect(getApiKey("mainnet", override)).toBe(override);
  });

  it("trims whitespace from an override and falls back to the default when blank", () => {
    expect(getApiKey("mainnet", "   ")).toBe(getApiKey("mainnet"));
  });
});

describe("warnIfClientMissingApiKey", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    resetMissingApiKeyWarnings();
    // Force the "client" branch on by giving globalThis a minimal window.
    if (typeof globalThis.window === "undefined") {
      // biome-ignore lint/suspicious/noExplicitAny: minimal test stub
      (globalThis as any).window = {};
    }
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (typeof originalWindow === "undefined") {
      // biome-ignore lint/suspicious/noExplicitAny: restore stub
      delete (globalThis as any).window;
    }
  });

  it("logs a console.error for networks expected to have a key", () => {
    warnIfClientMissingApiKey("mainnet");
    expect(console.error).toHaveBeenCalledTimes(1);
    const [msg] = (console.error as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(String(msg)).toContain("No Aptos API key configured");
    expect(String(msg)).toContain("mainnet");
    expect(String(msg)).toContain("VITE_APTOS_MAINNET_API_KEY");
  });

  it("warns once per network even when called multiple times", () => {
    warnIfClientMissingApiKey("mainnet");
    warnIfClientMissingApiKey("mainnet");
    warnIfClientMissingApiKey("mainnet");
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("warns independently for each network", () => {
    warnIfClientMissingApiKey("mainnet");
    warnIfClientMissingApiKey("testnet");
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it("does not warn for local (no public key expected)", () => {
    warnIfClientMissingApiKey("local");
    expect(console.error).not.toHaveBeenCalled();
  });
});
