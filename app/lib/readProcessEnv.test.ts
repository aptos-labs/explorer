import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {afterEach, describe, expect, it} from "vitest";
import {readProcessEnv} from "./readProcessEnv";

const SRC = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "readProcessEnv.ts"),
  "utf8",
);

describe("readProcessEnv", () => {
  const original = process.env.APTOS_EXPLORER_READ_PROCESS_ENV_PROBE;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.APTOS_EXPLORER_READ_PROCESS_ENV_PROBE;
    } else {
      process.env.APTOS_EXPLORER_READ_PROCESS_ENV_PROBE = original;
    }
  });

  it("returns a value set on process.env after this module was imported", () => {
    // Covers FEAT-RATELIMIT-004 — SSR must read APTOS_* keys at runtime, not
    // from a Vite-inlined empty object.
    process.env.APTOS_EXPLORER_READ_PROCESS_ENV_PROBE = "  live-value  ";
    expect(readProcessEnv("APTOS_EXPLORER_READ_PROCESS_ENV_PROBE")).toBe(
      "live-value",
    );
  });

  it("returns undefined for missing, blank, or non-string values", () => {
    delete process.env.APTOS_EXPLORER_READ_PROCESS_ENV_PROBE;
    expect(
      readProcessEnv("APTOS_EXPLORER_READ_PROCESS_ENV_PROBE"),
    ).toBeUndefined();
    process.env.APTOS_EXPLORER_READ_PROCESS_ENV_PROBE = "   ";
    expect(
      readProcessEnv("APTOS_EXPLORER_READ_PROCESS_ENV_PROBE"),
    ).toBeUndefined();
  });

  it('accesses env through process["env"] so Vite cannot replace process.env', () => {
    const body = SRC.slice(SRC.indexOf("export function"));
    expect(body).toMatch(/process\["env"\]/);
    expect(body).not.toMatch(/process\.env\b/);
  });
});
