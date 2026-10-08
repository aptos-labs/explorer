// Covers CVE-2026-104846 / GHSA-p6vx-979v-rg4c — seroval fromJSON thenable assimilation
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, it} from "vitest";

const FIRST_AFFECTED: [number, number, number] = [0, 12, 0];
const FIRST_PATCHED: [number, number, number] = [1, 6, 2];

function parseVersion(version: string): [number, number, number] {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!match) {
    throw new Error(`unparseable seroval version: ${version}`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isLess(
  left: [number, number, number],
  right: [number, number, number],
): boolean {
  return (
    left[0] < right[0] ||
    (left[0] === right[0] &&
      (left[1] < right[1] || (left[1] === right[1] && left[2] < right[2])))
  );
}

function isAffected(version: string): boolean {
  const parsed = parseVersion(version);
  return !isLess(parsed, FIRST_AFFECTED) && isLess(parsed, FIRST_PATCHED);
}

function lockedSerovalVersions(lockfile: string): string[] {
  const versions = new Set<string>();
  const packageKey = /^ {2}seroval@([^:(]+):$/gm;
  for (const match of lockfile.matchAll(packageKey)) {
    versions.add(match[1]);
  }
  return [...versions].sort();
}

describe("CVE-2026-104846 — seroval thenable assimilation", () => {
  it("does not lock a seroval release in the affected range", () => {
    const lockfile = readFileSync(
      join(process.cwd(), "pnpm-lock.yaml"),
      "utf8",
    );
    const versions = lockedSerovalVersions(lockfile);

    expect(versions.length).toBeGreaterThan(0);
    expect(versions.filter(isAffected)).toEqual([]);
  });

  it("installs patched seroval with the thenable guard", () => {
    const store = join(process.cwd(), "node_modules/.pnpm");
    const entries = readdirSync(store).filter((name) =>
      name.startsWith("seroval@"),
    );

    expect(entries.length).toBeGreaterThan(0);
    expect(
      entries
        .map((name) => name.slice("seroval@".length).split("_")[0])
        .filter(isAffected),
    ).toEqual([]);

    for (const entry of entries) {
      const dist = readFileSync(
        join(store, entry, "node_modules/seroval/dist/index.js"),
        "utf8",
      );
      expect(dist).toContain("function isThennable(");
      expect(dist).toContain("if (isThennable(deserialized))");
    }
  });
});
