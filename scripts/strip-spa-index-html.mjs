#!/usr/bin/env node
/**
 * Post-`vite build` safety net: delete the Vite SPA `index.html` shell from
 * Nitro / Vite / Vercel output dirs so `{ handle: "filesystem" }` cannot
 * serve `/app/client.tsx` as the production document.
 *
 * Keep this file's path list in sync with `SPA_INDEX_HTML_OUTPUT_DIRS` /
 * `SPA_INDEX_HTML_FILES` in `app/utils/omitSpaIndexHtml.ts`.
 */
import {existsSync} from "node:fs";
import {rm} from "node:fs/promises";
import {join} from "node:path";

const ROOT = process.cwd();
const DIRS = ["dist", "dist/client", ".output/public", ".vercel/output/static"];
const FILES = ["index.html", "index.html.gz", "index.html.br"];

const removed = [];
await Promise.all(
  DIRS.flatMap((dir) =>
    FILES.map(async (name) => {
      const abs = join(ROOT, dir, name);
      if (!existsSync(abs)) return;
      await rm(abs, {force: true});
      removed.push(`${dir}/${name}`);
    }),
  ),
);

if (removed.length > 0) {
  console.info(`[strip-spa-index-html] removed ${removed.sort().join(", ")}`);
}
