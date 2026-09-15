#!/usr/bin/env node
/**
 * Convert a locale JSON catalog (same shape as the English dump) into a
 * TypeScript module: `export const {locale} = { ... } as const satisfies MessageTree`.
 *
 * Usage: node scripts/i18n-json-to-catalog.mjs zh path/to/zh.json app/i18n/messages/zh.ts
 */
import {readFileSync, writeFileSync} from "node:fs";

const locale = process.argv[2];
const jsonPath = process.argv[3];
const outPath = process.argv[4];

if (!locale || !jsonPath || !outPath) {
  console.error(
    "Usage: node scripts/i18n-json-to-catalog.mjs <locale> <in.json> <out.ts>",
  );
  process.exit(1);
}

if (!/^[a-z]{2,3}(-[A-Za-z]+)?$/.test(locale)) {
  console.error(`Unsupported locale id: ${locale}`);
  process.exit(1);
}

const exportName = locale.includes("-")
  ? locale.replace(
      /-([A-Za-z]+)/g,
      (_, part) => part[0].toUpperCase() + part.slice(1),
    )
  : locale;

function emit(value, indent) {
  const pad = "  ".repeat(indent);
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    const inner = value
      .map((item) => `${pad}  ${emit(item, indent + 1)},`)
      .join("\n");
    return `[\n${inner}\n${pad}]`;
  }
  if (value && typeof value === "object") {
    const inner = Object.entries(value)
      .map(([key, nested]) => {
        const ident = /^[A-Za-z_$][\w$]*$/.test(key)
          ? key
          : JSON.stringify(key);
        return `${pad}  ${ident}: ${emit(nested, indent + 1)},`;
      })
      .join("\n");
    return `{\n${inner}\n${pad}}`;
  }
  return JSON.stringify(value);
}

const data = JSON.parse(readFileSync(jsonPath, "utf8"));
const source = `import type {MessageTree} from "../translate";

export const ${exportName} = ${emit(data, 0)} as const satisfies MessageTree;
`;
writeFileSync(outPath, source);
console.log(`Wrote ${outPath}`);
