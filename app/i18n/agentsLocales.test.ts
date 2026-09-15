import {readFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";
import {LOCALE_META, SUPPORTED_LOCALES} from "./locales";

const agentsMd = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "..", "AGENTS.md"),
  "utf8",
);

const BEGIN = "<!-- i18n-supported-locales -->";
const END = "<!-- /i18n-supported-locales -->";

function shippedLocaleRowsFromAgents(markdown: string): {
  id: string;
  nativeName: string;
}[] {
  const begin = markdown.indexOf(BEGIN);
  const end = markdown.indexOf(END);
  expect(
    begin,
    "AGENTS.md is missing the i18n-supported-locales start marker",
  ).toBeGreaterThan(-1);
  expect(
    end,
    "AGENTS.md is missing the i18n-supported-locales end marker",
  ).toBeGreaterThan(begin);
  const block = markdown.slice(begin + BEGIN.length, end);
  const rows: {id: string; nativeName: string}[] = [];
  for (const line of block.split("\n")) {
    const match = line.match(/^\|\s*`([^`]+)`\s*\|\s*([^|]*?)\s*\|/);
    if (!match) {
      continue;
    }
    rows.push({id: match[1], nativeName: match[2].trim()});
  }
  return rows;
}

describe("FEAT-I18N-001 — AGENTS.md shipped locales", () => {
  it("lists every SUPPORTED_LOCALES id with matching LOCALE_META native names", () => {
    const rows = shippedLocaleRowsFromAgents(agentsMd);
    expect(
      rows.map((row) => row.id),
      "Update the shipped-locales table in AGENTS.md when changing SUPPORTED_LOCALES",
    ).toEqual([...SUPPORTED_LOCALES]);
    for (const row of rows) {
      expect(row.nativeName, `AGENTS.md native name for ${row.id}`).toBe(
        LOCALE_META[row.id as keyof typeof LOCALE_META].nativeName,
      );
    }
  });
});
