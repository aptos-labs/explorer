import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";
import {DISCOVERY_LINK_VALUES} from "./agentDiscoveryHeaders";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "../..");
const vercelJson = JSON.parse(
  readFileSync(join(repoRoot, "vercel.json"), "utf8"),
) as {
  framework?: string;
  buildCommand?: string;
  outputDirectory?: string;
  headers?: Array<{
    source: string;
    headers: Array<{key: string; value: string}>;
  }>;
};

function headerValue(source: string, key: string): string | undefined {
  const block = vercelJson.headers?.find((entry) => entry.source === source);
  return block?.headers.find(
    (header) => header.key.toLowerCase() === key.toLowerCase(),
  )?.value;
}

describe("vercel.json headers", () => {
  // Covers FEAT-SEO-004 — Vercel must use Nitro SSR, not the Vite SPA preset
  it("declares TanStack Start so Vercel consumes Nitro's Build Output API", () => {
    expect(vercelJson.framework).toBe("tanstack-start");
    expect(vercelJson.buildCommand).toBe("pnpm build");
    // Nitro's Vercel preset writes `.vercel/output` (Build Output API v3).
    // Pinning an output directory would republish a static Vite `dist` instead.
    expect(vercelJson.outputDirectory).toBeUndefined();
  });

  it("attaches RFC 8288 Link headers on / and the catch-all source", () => {
    const rootLink = headerValue("/", "Link");
    const catchAllLink = headerValue("/(.*)", "Link");

    expect(rootLink).toBeDefined();
    expect(catchAllLink).toBeDefined();
    expect(rootLink).toBe(catchAllLink);

    for (const value of DISCOVERY_LINK_VALUES) {
      expect(rootLink).toContain(value);
    }
  });

  it("varies on Accept so markdown negotiation is cache-safe", () => {
    expect(headerValue("/", "Vary")).toBe("Accept");
    expect(headerValue("/(.*)", "Vary")).toBe("Accept");
  });
});
