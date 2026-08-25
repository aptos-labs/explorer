import {existsSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

/**
 * Nitro resolves its HTML renderer before TanStack Start's SSR handler is
 * mounted: when a root `index.html` exists it becomes `renderer.template`, the
 * `renderer-template` handler takes the `/**` route, and Nitro then skips
 * installing `ssr-renderer`. Every request answers with that raw HTML file, so
 * SSR silently never runs. Both guards below have to hold.
 */
describe("Nitro SSR renderer", () => {
  // Covers FEAT-SEO-004 — production HTML must be TanStack Start SSR
  it("opts out of the Nitro HTML renderer in vite.config.ts", () => {
    const viteConfig = readFileSync(join(repoRoot, "vite.config.ts"), "utf8");
    expect(viteConfig).toMatch(/nitro\(\{[^}]*renderer:\s*false/s);
  });

  it("has no root index.html for Nitro to adopt as a renderer template", () => {
    expect(existsSync(join(repoRoot, "index.html"))).toBe(false);
  });
});
