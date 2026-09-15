#!/usr/bin/env node
/**
 * Deep-merge an existing chrome/settings/guide catalog with a translated
 * extra-key tree, then emit TypeScript.
 *
 * Usage:
 *   node scripts/i18n-merge-extra.mjs <locale> <existing.json> <extra.json> <out.ts>
 */
import {readFileSync, writeFileSync} from "node:fs";
import {spawnSync} from "node:child_process";

const [locale, existingPath, extraPath, outPath] = process.argv.slice(2);
if (!locale || !existingPath || !extraPath || !outPath) {
  console.error(
    "Usage: node scripts/i18n-merge-extra.mjs <locale> <existing.json> <extra.json> <out.ts>",
  );
  process.exit(1);
}

function deepMerge(base, extra) {
  if (extra === undefined) {
    return base;
  }
  if (
    extra &&
    typeof extra === "object" &&
    !Array.isArray(extra) &&
    base &&
    typeof base === "object" &&
    !Array.isArray(base)
  ) {
    const out = {...base};
    for (const [key, value] of Object.entries(extra)) {
      out[key] = deepMerge(base[key], value);
    }
    return out;
  }
  return extra;
}

const existing = JSON.parse(readFileSync(existingPath, "utf8"));
const extra = JSON.parse(readFileSync(extraPath, "utf8"));
const merged = deepMerge(existing, extra);
const tmp = `/tmp/${locale.replaceAll("/", "-")}-merged.json`;
writeFileSync(tmp, `${JSON.stringify(merged)}\n`);

const result = spawnSync(
  process.execPath,
  ["scripts/i18n-json-to-catalog.mjs", locale, tmp, outPath],
  {stdio: "inherit"},
);
process.exit(result.status ?? 1);
