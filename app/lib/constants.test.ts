// Covers client-side API key behavior and the missing-key console.error.
// These tests pin the contract that:
//   1. `getApiKey` returns whatever the `VITE_APTOS_<NETWORK>_API_KEY` env
//      var was set to at build time (or `undefined` when it wasn't).
//      The repo intentionally does NOT carry a hardcoded default — every
//      deployment is responsible for configuring its own key.
//   2. An explicit override always wins, and a blank override falls back
//      to the env var (or `undefined`).
//   3. `warnIfClientMissingApiKey` emits a one-time `console.error` on the
//      client when the env var is unset for a network that normally has
//      one, naming the env var so the misconfiguration is actionable.
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {
  getApiKey,
  getServerApiKey,
  resetMissingApiKeyWarnings,
  warnIfClientMissingApiKey,
  warnIfServerMissingApiKey,
} from "./constants";

describe("getApiKey", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    resetMissingApiKeyWarnings();
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

  it("prefers an explicit override over the env var", () => {
    const override = "AG-USER-OVERRIDE-KEY";
    expect(getApiKey("mainnet", override)).toBe(override);
    // An accepted override means the missing-key warning must NOT fire.
    expect(console.error).not.toHaveBeenCalled();
  });

  it("trims whitespace from an override and falls back when blank", () => {
    expect(getApiKey("mainnet", "   ")).toBe(getApiKey("mainnet"));
  });

  it("returns undefined for local (no public API key expected)", () => {
    const key = getApiKey("local");
    expect(key).toBeUndefined();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("emits a console.error when no env var is set for mainnet", () => {
    const key = getApiKey("mainnet");
    // CI workflows may map a non-existent secret to an empty string for the
    // env var. `clientApiKeys` normalizes that to `undefined`, so use a
    // truthiness check rather than `=== undefined` so this test is robust
    // whether `VITE_APTOS_MAINNET_API_KEY` is unset, empty, or set.
    if (!key) {
      expect(console.error).toHaveBeenCalledTimes(1);
      const [msg] = (console.error as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(String(msg)).toContain("No Aptos API key configured");
      expect(String(msg)).toContain("mainnet");
      expect(String(msg)).toContain("VITE_APTOS_MAINNET_API_KEY");
    } else {
      // Vitest run with a real VITE_APTOS_MAINNET_API_KEY (e.g. in CI):
      // the key flows through unchanged and the warning is suppressed.
      expect(console.error).not.toHaveBeenCalled();
    }
  });
});

describe("warnIfClientMissingApiKey", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    resetMissingApiKeyWarnings();
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

describe("warnIfServerMissingApiKey", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    resetMissingApiKeyWarnings();
    // Force the "server" branch: ensure `window` is undefined.
    if (typeof globalThis.window !== "undefined") {
      // biome-ignore lint/suspicious/noExplicitAny: test stub
      delete (globalThis as any).window;
    }
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // biome-ignore lint/suspicious/noExplicitAny: restore stub
    (globalThis as any).window = originalWindow;
  });

  it("logs a console.error for networks expected to have a key", () => {
    warnIfServerMissingApiKey("mainnet");
    expect(console.error).toHaveBeenCalledTimes(1);
    const [msg] = (console.error as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(String(msg)).toContain("No Aptos API key configured");
    expect(String(msg)).toContain("on the server");
    expect(String(msg)).toContain("mainnet");
    expect(String(msg)).toContain("APTOS_MAINNET_API_KEY");
    // Should also reference the matching client env var so operators
    // configure both at once.
    expect(String(msg)).toContain("VITE_APTOS_MAINNET_API_KEY");
  });

  it("warns once per network even when called multiple times", () => {
    warnIfServerMissingApiKey("mainnet");
    warnIfServerMissingApiKey("mainnet");
    warnIfServerMissingApiKey("mainnet");
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("warns independently for each network", () => {
    warnIfServerMissingApiKey("mainnet");
    warnIfServerMissingApiKey("testnet");
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it("does not warn for local", () => {
    warnIfServerMissingApiKey("local");
    expect(console.error).not.toHaveBeenCalled();
  });

  it("does not fire on the client (window defined)", () => {
    // biome-ignore lint/suspicious/noExplicitAny: minimal test stub
    (globalThis as any).window = {};
    warnIfServerMissingApiKey("mainnet");
    expect(console.error).not.toHaveBeenCalled();
  });
});

describe("getServerApiKey", () => {
  const originalWindow = globalThis.window;
  const originalEnv = {...process.env};

  beforeEach(() => {
    resetMissingApiKeyWarnings();
    if (typeof globalThis.window !== "undefined") {
      // biome-ignore lint/suspicious/noExplicitAny: test stub
      delete (globalThis as any).window;
    }
    // Clear all APTOS_*_API_KEY env vars + CONTEXT for a deterministic
    // baseline; restore in afterEach.
    for (const key of Object.keys(process.env)) {
      if (
        key === "CONTEXT" ||
        (key.startsWith("APTOS_") && key.endsWith("_API_KEY"))
      ) {
        delete process.env[key];
      }
    }
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = {...originalEnv};
    // biome-ignore lint/suspicious/noExplicitAny: restore stub
    (globalThis as any).window = originalWindow;
  });

  it("returns the APTOS_<NETWORK>_API_KEY env var when set", () => {
    process.env.APTOS_MAINNET_API_KEY = "AG-SERVER-KEY";
    expect(getServerApiKey("mainnet")).toBe("AG-SERVER-KEY");
    expect(console.error).not.toHaveBeenCalled();
  });

  it("emits a console.error when no server key is configured and no client fallback exists", () => {
    // The client fallback path uses build-time `VITE_APTOS_<NETWORK>_API_KEY`,
    // which can be set in CI / cloud runners (e.g. via injected secrets).
    // Branch on whether the test runtime actually has one:
    const result = getServerApiKey("mainnet");
    if (result === undefined) {
      // No client fallback either → warning should fire.
      expect(console.error).toHaveBeenCalledTimes(1);
      const [msg] = (console.error as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(String(msg)).toContain("on the server");
      expect(String(msg)).toContain("APTOS_MAINNET_API_KEY");
    } else {
      // The build-time client key was available and returned as a
      // fallback; no warning should have been emitted in that case.
      expect(console.error).not.toHaveBeenCalled();
    }
  });

  it("emits a console.error on Netlify preview contexts (deploy-preview)", () => {
    process.env.CONTEXT = "deploy-preview";
    process.env.APTOS_MAINNET_API_KEY = "AG-SHOULD-BE-IGNORED";
    expect(getServerApiKey("mainnet")).toBeUndefined();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("emits a console.error on Netlify preview contexts (branch-deploy)", () => {
    process.env.CONTEXT = "branch-deploy";
    expect(getServerApiKey("testnet")).toBeUndefined();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
