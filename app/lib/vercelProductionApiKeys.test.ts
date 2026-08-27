import {readFileSync} from "node:fs";
import {describe, expect, it} from "vitest";
import {
  assertVercelProductionClientApiKeys,
  missingVercelProductionClientApiKeys,
} from "./vercelProductionApiKeys";

describe("missingVercelProductionClientApiKeys", () => {
  // Covers FEAT-RATELIMIT-004 — Vercel production builds must bake client keys
  it("is a no-op when VERCEL_ENV is not production", () => {
    expect(
      missingVercelProductionClientApiKeys({
        VERCEL_ENV: "preview",
      }),
    ).toEqual([]);
    expect(missingVercelProductionClientApiKeys({})).toEqual([]);
  });

  it("lists missing VITE_APTOS_* keys on Vercel production", () => {
    expect(
      missingVercelProductionClientApiKeys({
        VERCEL_ENV: "production",
      }),
    ).toEqual([
      "VITE_APTOS_MAINNET_API_KEY",
      "VITE_APTOS_TESTNET_API_KEY",
      "VITE_APTOS_DEVNET_API_KEY",
    ]);
  });

  it("ignores blank values and passes when all three are set", () => {
    expect(
      missingVercelProductionClientApiKeys({
        VERCEL_ENV: "production",
        VITE_APTOS_MAINNET_API_KEY: "AG-MAIN",
        VITE_APTOS_TESTNET_API_KEY: "   ",
        VITE_APTOS_DEVNET_API_KEY: "AG-DEV",
      }),
    ).toEqual(["VITE_APTOS_TESTNET_API_KEY"]);
    expect(
      missingVercelProductionClientApiKeys({
        VERCEL_ENV: "production",
        VITE_APTOS_MAINNET_API_KEY: "AG-MAIN",
        VITE_APTOS_TESTNET_API_KEY: "AG-TEST",
        VITE_APTOS_DEVNET_API_KEY: "AG-DEV",
      }),
    ).toEqual([]);
  });
});

describe("assertVercelProductionClientApiKeys", () => {
  it("throws a message that distinguishes anonymous 429s from a key quota", () => {
    expect(() =>
      assertVercelProductionClientApiKeys({VERCEL_ENV: "production"}),
    ).toThrow(/anonymous IP bucket/);
    expect(() =>
      assertVercelProductionClientApiKeys({
        VERCEL_ENV: "production",
        VITE_APTOS_MAINNET_API_KEY: "AG-MAIN",
        VITE_APTOS_TESTNET_API_KEY: "AG-TEST",
        VITE_APTOS_DEVNET_API_KEY: "AG-DEV",
      }),
    ).not.toThrow();
  });
});

describe("vite production build hook", () => {
  it("registers assertVercelProductionClientApiKeys on buildStart", () => {
    const src = readFileSync(
      new URL("../../vite.config.ts", import.meta.url),
      "utf8",
    );
    expect(src).toMatch(/assertVercelProductionClientApiKeys/);
    expect(src).toMatch(/apply: "build"/);
  });
});
