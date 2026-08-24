import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {describe, expect, it} from "vitest";
import {DISCOVERY_LINK_VALUES} from "./agentDiscoveryHeaders";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "../..");
const vercelJson = JSON.parse(
  readFileSync(join(repoRoot, "vercel.json"), "utf8"),
) as {
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
