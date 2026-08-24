/**
 * Root `index.html` is the Vite *dev* shell: it loads `/app/client.tsx` as a
 * module. Production HTML is SSR from `app/routes/__root.tsx` (`<Scripts />`
 * injects hashed `/assets/*.js`). If that shell is published as a static file,
 * Vercel’s filesystem handler (or the Vite SPA fallback) serves it for `/`,
 * the browser requests `/app/client.tsx`, and the host returns `text/html`
 * (MIME check fails).
 *
 * Nitro’s Vite plugin defaults `environments.client.build.rollupOptions.input`
 * to `renderer.template` (`./index.html`) unless we set a JS/TS client entry.
 * `appType: "custom"` then copies that HTML without rewriting the `.tsx` src.
 */
import {existsSync} from "node:fs";
import {rm} from "node:fs/promises";
import {join} from "node:path";

export const CLIENT_BUILD_ENTRY = "app/client.tsx";

export function resolveClientBuildInput(rootDir: string): string {
  return join(rootDir, CLIENT_BUILD_ENTRY);
}

export function isSpaIndexHtmlOutput(fileName: string): boolean {
  const base = (fileName.split(/[/\\]/).pop() ?? fileName).toLowerCase();
  return (
    base === "index.html" ||
    base === "index.html.gz" ||
    base === "index.html.br"
  );
}

/** True when HTML still points the browser at the unbundled Vite dev entry. */
export function isSpaShellHtml(html: string): boolean {
  return /<script\b[^>]*\bsrc\s*=\s*["']\/app\/client\.tsx["']/i.test(html);
}

export const SPA_INDEX_HTML_FILES = [
  "index.html",
  "index.html.gz",
  "index.html.br",
] as const;

/** Directories Nitro / Vite / Vercel may publish as the static asset root. */
export const SPA_INDEX_HTML_OUTPUT_DIRS = [
  "dist",
  "dist/client",
  ".output/public",
  ".vercel/output/static",
] as const;

export function spaIndexHtmlOutputPaths(rootDir: string): string[] {
  return SPA_INDEX_HTML_OUTPUT_DIRS.flatMap((dir) =>
    SPA_INDEX_HTML_FILES.map((name) => join(rootDir, dir, name)),
  );
}

/**
 * Delete leftover SPA `index.html` (+ compressed copies) from known build
 * outputs so Vercel’s `{ handle: "filesystem" }` route cannot shadow SSR.
 */
export async function stripSpaIndexHtmlFromBuildOutputs(
  rootDir: string,
  extraDirs: string[] = [],
): Promise<string[]> {
  const dirs = [
    ...SPA_INDEX_HTML_OUTPUT_DIRS.map((dir) => join(rootDir, dir)),
    ...extraDirs,
  ];
  const removed: string[] = [];
  await Promise.all(
    dirs.flatMap((dir) =>
      SPA_INDEX_HTML_FILES.map(async (name) => {
        const abs = join(dir, name);
        if (!existsSync(abs)) return;
        await rm(abs, {force: true});
        removed.push(abs);
      }),
    ),
  );
  return removed.sort();
}
